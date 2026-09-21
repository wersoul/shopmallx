import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensurePrisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const prisma = await ensurePrisma();
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const products = await prisma.product.findMany({ orderBy: { createdAt: 'desc' }, include: { category: true } });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const prisma = await ensurePrisma();
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const product = await prisma.product.create({
    data: {
      name: data.name, slug, description: data.description || '',
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