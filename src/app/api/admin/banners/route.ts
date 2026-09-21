import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ banners });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json();
  const banner = await prisma.banner.create({ data });
  return NextResponse.json({ success: true, banner });
}