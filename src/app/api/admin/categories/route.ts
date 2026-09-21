import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensurePrisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const prisma = await ensurePrisma();
  const cats = await prisma.category.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ categories: cats });
}

export async function POST(req: NextRequest) {
  const prisma = await ensurePrisma();
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const slug = data.slug || data.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  const cat = await prisma.category.create({
    data: {
      name: data.name, slug,
      description: data.description || null,
      parentId: data.parentId || null,
      image: data.image || null,
      sortOrder: parseInt(data.sortOrder) || 0,
      isActive: data.isActive !== false
    }
  });
  return NextResponse.json({ success: true, category: cat });
}