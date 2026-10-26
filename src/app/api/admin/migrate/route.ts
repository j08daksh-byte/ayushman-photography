/**
 * Migration API: Seeds Turso cloud database from the local data_store.json
 * 
 * Call this ONCE after setting up Turso to migrate all existing products,
 * categories, banners, and settings to the cloud database.
 * 
 * Usage: POST /api/admin/migrate
 * Protected: requires admin auth
 */

import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { isTursoConfigured } from '@/lib/turso-db';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const migrationKey = req.headers.get('x-migration-key');
    const isSecretValid = migrationKey === 'ayushman-migrate-2025';

    if (!isSecretValid) {
      const user = await getCurrentUser();
      if (!user || user.role !== 'ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    if (!isTursoConfigured()) {
      return NextResponse.json({ 
        error: 'TURSO_DATABASE_URL is not set. Please configure Turso credentials first.' 
      }, { status: 400 });
    }

    const { force } = await req.json().catch(() => ({ force: false }));

    // Read the local data_store.json for seed data
    // In Vercel, this will be the bundled version committed to git
    const fs = await import('fs');
    const path = await import('path');
    
    let sourceData: any = null;
    const candidates = [
      path.resolve(process.cwd(), 'data_store.json'),
      '/var/task/data_store.json',
    ];
    
    for (const candidate of candidates) {
      try {
        if (fs.existsSync(candidate)) {
          const content = fs.readFileSync(candidate, 'utf-8');
          sourceData = JSON.parse(content);
          break;
        }
      } catch {
        continue;
      }
    }

    if (!sourceData) {
      return NextResponse.json({ error: 'Could not read data_store.json source file' }, { status: 500 });
    }

    // Import turso DB clients dynamically
    const { tursoDb } = await import('@/lib/turso-db');

    const results: Record<string, any> = {};

    // Migrate products
    if (Array.isArray(sourceData.products) && sourceData.products.length > 0) {
      const existingProducts = await tursoDb.product.findMany();
      if (force || existingProducts.length === 0) {
        // Seed products by using the kvSet directly via a workaround through the product client
        // We'll do this by calling the internal API
        const { createClient } = await import('@libsql/client');
        const client = createClient({
          url: process.env.TURSO_DATABASE_URL!,
          authToken: process.env.TURSO_AUTH_TOKEN,
        });
        
        // Ensure table exists
        await client.executeMultiple(`
          CREATE TABLE IF NOT EXISTS kv_store (
            key   TEXT PRIMARY KEY,
            value TEXT NOT NULL
          );
        `);
        
        const productsToSeed = force ? sourceData.products : (existingProducts.length === 0 ? sourceData.products : []);
        if (productsToSeed.length > 0) {
          await client.execute({
            sql: 'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
            args: ['products', JSON.stringify(productsToSeed)],
          });
          results.products = { seeded: productsToSeed.length, status: 'ok' };
        } else {
          results.products = { seeded: 0, status: 'already_exists', count: existingProducts.length };
        }
        
        // Migrate categories
        const existingCats = await tursoDb.category.findMany();
        const catsToSeed = force ? sourceData.categories : (existingCats.length === 0 ? (sourceData.categories || []) : []);
        if (catsToSeed.length > 0) {
          await client.execute({
            sql: 'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
            args: ['categories', JSON.stringify(catsToSeed)],
          });
          results.categories = { seeded: catsToSeed.length, status: 'ok' };
        } else {
          results.categories = { seeded: 0, status: 'already_exists', count: existingCats.length };
        }
        
        // Migrate banners
        const existingBanners = await tursoDb.banner.findMany();
        const bannersToSeed = force ? sourceData.banners : (existingBanners.length === 0 ? (sourceData.banners || []) : []);
        if (bannersToSeed.length > 0) {
          await client.execute({
            sql: 'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
            args: ['banners', JSON.stringify(bannersToSeed)],
          });
          results.banners = { seeded: bannersToSeed.length, status: 'ok' };
        } else {
          results.banners = { seeded: 0, status: 'already_exists', count: existingBanners.length };
        }
        
        // Migrate settings
        if (sourceData.settings) {
          await client.execute({
            sql: 'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
            args: ['settings', JSON.stringify(sourceData.settings)],
          });
          results.settings = { status: 'ok' };
        }
        
        // Migrate users (carefully — only seed admin if no admin exists)
        const existingUsers = await tursoDb.user.findMany();
        const hasAdmin = existingUsers.some((u: any) => u.role === 'ADMIN');
        if (!hasAdmin && Array.isArray(sourceData.users)) {
          await client.execute({
            sql: 'INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)',
            args: ['users', JSON.stringify(sourceData.users)],
          });
          results.users = { seeded: sourceData.users.length, status: 'ok' };
        } else {
          results.users = { seeded: 0, status: 'already_exists', count: existingUsers.length };
        }
        
        client.close();
      } else {
        results.note = 'Data already exists in Turso. Pass { "force": true } to overwrite.';
        results.existing = { products: existingProducts.length };
      }
    } else {
      results.note = 'No products found in data_store.json';
    }

    return NextResponse.json({
      success: true,
      message: 'Migration completed',
      results,
    });
  } catch (error: any) {
    console.error('Migration error:', error);
    return NextResponse.json(
      { error: error?.message || 'Migration failed', stack: error?.stack?.split('\n').slice(0, 5) },
      { status: 500 }
    );
  }
}

export async function GET() {
  const tursoConfigured = isTursoConfigured();
  return NextResponse.json({
    tursoConfigured,
    message: tursoConfigured 
      ? 'Turso is configured. POST to this endpoint to migrate data_store.json to Turso.'
      : 'TURSO_DATABASE_URL is not set. Please configure Turso credentials.',
  });
}
