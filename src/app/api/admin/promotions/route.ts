import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const items = await prisma.promotion.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ promotions: items });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json();
  const item = await prisma.promotion.create({ data });
  return NextResponse.json({ success: true, promotion: item });
}