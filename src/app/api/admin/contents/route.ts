import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const items = await prisma.content.findMany();
  return NextResponse.json({ contents: items });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const item = await prisma.content.upsert({
    where: { key: data.key },
    update: { title: data.title, body: data.body },
    create: { key: data.key, title: data.title, body: data.body }
  });
  return NextResponse.json({ success: true, content: item });
}