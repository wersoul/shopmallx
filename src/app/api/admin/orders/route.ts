import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensurePrisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const prisma = await ensurePrisma();
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true, user: { select: { name: true, email: true } } }
  });
  return NextResponse.json({ orders });
}