import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category');

    const products = await db.product.findMany({
      where: category ? { category } : undefined,
    });

    return NextResponse.json({
      success: true,
      products,
    });
  } catch (error: any) {
    console.error('Error fetching admin products:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      title,
      category,
      badge,
      price,
      numericPrice,
      unit,
      image,
      description,
      customizerId,
      features,
      paperOptions,
      quantityOptions,
      cornerOptions,
      isActive,
    } = body;

    if (!title || !category || !price) {
      return NextResponse.json(
        { error: 'Title, category and price are required' },
        { status: 400 }
      );
    }

    const numPrice = Number(numericPrice) || parseInt(price.replace(/[^0-9]/g, '')) || 1000;

    const parsedPaperOptions = Array.isArray(paperOptions)
      ? paperOptions
          .map((p: any) => ({
            label: String(p.label || '').trim(),
            extraPrice: Number(p.extraPrice) || 0,
          }))
          .filter((p) => Boolean(p.label))
      : undefined;

    const parsedQuantityOptions = Array.isArray(quantityOptions)
      ? quantityOptions
          .map((q: any) => ({
            qty: Number(q.qty) || 100,
            multiplier: Number(q.multiplier) || 1,
          }))
          .filter((q) => q.qty > 0)
      : undefined;

    const parsedCornerOptions = Array.isArray(cornerOptions)
      ? cornerOptions.map((c: any) => String(c).trim()).filter(Boolean)
      : (typeof cornerOptions === 'string'
          ? cornerOptions.split(',').map((s) => s.trim()).filter(Boolean)
          : undefined);

    const product = await db.product.create({
      data: {
        customizerId: customizerId || 'visiting-card',
        title,
        category,
        badge: badge || `100 PCS @ ${price}`,
        price: price.startsWith('₹') ? price : `₹${price}`,
        numericPrice: numPrice,
        unit: unit || '100 Units',
        image: image || '/images/wedding/scroll_royal_blue_velvet.png',
        description: description || 'High quality customized printing with premium finishes.',
        features: Array.isArray(features) ? features : (features ? features.split('\n').filter(Boolean) : ['High Quality Print', 'Fast Dispatch']),
        paperOptions: parsedPaperOptions,
        quantityOptions: parsedQuantityOptions,
        cornerOptions: parsedCornerOptions,
        rating: 5.0,
        reviews: 1,
        isActive: isActive !== undefined ? isActive : true,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Product created successfully',
      product,
    });
  } catch (error: any) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to create product' },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, ...data } = body;

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    if (data.numericPrice) {
      data.numericPrice = Number(data.numericPrice);
    }
    if (data.features && typeof data.features === 'string') {
      data.features = data.features.split('\n').filter(Boolean);
    }
    if (data.paperOptions !== undefined) {
      data.paperOptions = Array.isArray(data.paperOptions)
        ? data.paperOptions
            .map((p: any) => ({
              label: String(p.label || '').trim(),
              extraPrice: Number(p.extraPrice) || 0,
            }))
            .filter((p: any) => Boolean(p.label))
        : [];
    }
    if (data.quantityOptions !== undefined) {
      data.quantityOptions = Array.isArray(data.quantityOptions)
        ? data.quantityOptions
            .map((q: any) => ({
              qty: Number(q.qty) || 100,
              multiplier: Number(q.multiplier) || 1,
            }))
            .filter((q: any) => q.qty > 0)
        : [];
    }
    if (data.cornerOptions !== undefined) {
      data.cornerOptions = Array.isArray(data.cornerOptions)
        ? data.cornerOptions.map((c: any) => String(c).trim()).filter(Boolean)
        : (typeof data.cornerOptions === 'string'
            ? data.cornerOptions.split(',').map((s: string) => s.trim()).filter(Boolean)
            : []);
    }

    const updated = await db.product.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully',
      product: updated,
    });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update product' },
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

    if (!id || !id.trim()) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const deleted = await db.product.delete({ where: { id: id.trim() } });

    return NextResponse.json({
      success: true,
      deleted,
      message: 'Product deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete product' },
      { status: 500 }
    );
  }
}
