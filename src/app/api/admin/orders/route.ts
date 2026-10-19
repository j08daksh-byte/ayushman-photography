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

    const orders = await db.booking.findMany();

    // Sort newest first
    orders.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Calculate Summary Analytics
    const totalOrders = orders.length;
    const totalRevenue = orders
      .filter((o: any) => o.paymentStatus === 'PAID')
      .reduce((sum: number, o: any) => sum + (Number(o.totalAmount) || 0), 0);
    const pendingOrders = orders.filter((o: any) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED').length;
    const paidOrders = orders.filter((o: any) => o.paymentStatus === 'PAID').length;

    return NextResponse.json({
      success: true,
      orders,
      stats: {
        totalOrders,
        totalRevenue,
        pendingOrders,
        paidOrders,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch admin orders' }, { status: 500 });
  }
}

async function handleOrderUpdate(req: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 });
    }

    const body = await req.json();
    const orderId = body.orderId || body.id;
    const { status, paymentStatus, notes } = body;

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required.' }, { status: 400 });
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (paymentStatus) updateData.paymentStatus = paymentStatus;
    if (notes !== undefined) updateData.notes = notes;

    const updatedOrder = await db.booking.update({
      where: { id: orderId },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Order ${orderId} updated successfully!`,
      order: updatedOrder,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update order' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  return handleOrderUpdate(req);
}

export async function PATCH(req: Request) {
  return handleOrderUpdate(req);
}

export async function DELETE(req: Request) {
  try {
    const admin = await checkAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized. Admin role required.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get('id');

    if (!orderId) {
      return NextResponse.json({ error: 'Order ID parameter is required.' }, { status: 400 });
    }

    await db.booking.delete({ where: { id: orderId } });

    return NextResponse.json({
      success: true,
      message: `Order ${orderId} deleted successfully.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to delete order' }, { status: 500 });
  }
}
