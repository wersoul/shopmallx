import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensurePrisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const prisma = await ensurePrisma();
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  return NextResponse.json({ banners });
}

export async function POST(req: NextRequest) {
  const prisma = await ensurePrisma();
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const banner = await prisma.banner.create({ data });
  return NextResponse.json({ success: true, banner });
}