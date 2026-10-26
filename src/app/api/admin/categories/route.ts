import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await db.category.findMany();
    const products = await db.product.findMany();

    // Attach product count to each category
    const categoriesWithCount = categories.map((cat: any) => ({
      ...cat,
      count: products.filter((p: any) => p.category === cat.id).length,
    }));

    return NextResponse.json({
      success: true,
      categories: categoriesWithCount,
    });
  } catch (error: any) {
    console.error('Error fetching admin categories:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Please login as admin.' }, { status: 401 });
    }

    const body = await req.json();
    let { id, label, icon, description } = body;

    if (!label || !label.trim()) {
      return NextResponse.json(
        { error: 'Category Label is required' },
        { status: 400 }
      );
    }

    let catId = (id || '').trim();
    if (!catId) {
      catId = label.trim().replace(/^[^\w\s]+/u, '').trim() || `cat_${Date.now()}`;
    }

    const category = await db.category.create({
      data: {
        id: catId,
        label: label.trim(),
        icon: icon || '📦',
        description: description || '',
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Category created successfully',
      category,
    });
  } catch (error: any) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create category' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Please login as admin.' }, { status: 401 });
    }

    const body = await req.json();
    let { id, label, icon, description } = body;

    if (!id && label) {
      id = label.trim();
    }

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const updated = await db.category.update({
      where: { id: id.trim() },
      data: {
        label: label ? label.trim() : undefined,
        icon: icon || undefined,
        description: description !== undefined ? description : undefined,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Category updated successfully',
      category: updated,
    });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update category' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized. Please login as admin.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }

    const deleted = await db.category.delete({ where: { id: id.trim() } });

    return NextResponse.json({
      success: true,
      deleted,
      message: 'Category deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete category' },
      { status: 500 }
    );
  }
}
