import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensurePrisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = await ensurePrisma();
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const cat = await prisma.category.update({
    where: { id: params.id },
    data: {
      name: data.name, description: data.description || null,
      parentId: data.parentId || null, image: data.image || null,
      sortOrder: parseInt(data.sortOrder) || 0,
      isActive: data.isActive !== false
    }
  });
  return NextResponse.json({ success: true, category: cat });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const prisma = await ensurePrisma();
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  await prisma.category.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}