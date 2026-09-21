import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensurePrisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = await ensurePrisma();
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const product = await prisma.product.update({
    where: { id: params.id },
    data: {
      name: data.name, description: data.description || '',
      price: parseFloat(data.price) || 0,
      salePrice: data.salePrice ? parseFloat(data.salePrice) : null,
      stock: parseInt(data.stock) || 0,
      categoryId: data.categoryId,
      brand: data.brand || null,
      images: JSON.stringify(data.images || []),
      isActive: data.isActive !== false,
      isFeatured: !!data.isFeatured,
      isNew: !!data.isNew
    }
  });
  return NextResponse.json({ success: true, product });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = await ensurePrisma();
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  await prisma.product.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}