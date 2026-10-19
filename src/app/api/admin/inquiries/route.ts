import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

async function checkAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return null;
  }
  return user;
}

export async function GET() {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 });
    }

    const inquiries = await db.inquiry.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return NextResponse.json({
      success: true,
      inquiries: inquiries || [],
    });
  } catch (error: any) {
    console.error('Error fetching admin inquiries:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Inquiry ID is required' }, { status: 400 });
    }

    await db.inquiry.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      message: 'Inquiry deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting admin inquiry:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete inquiry' },
      { status: 500 }
    );
  }
}
