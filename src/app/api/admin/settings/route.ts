import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const items = await prisma.setting.findMany();
  return NextResponse.json({ settings: items });
}

export async function PUT(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const updates = [];
  for (const [key, value] of Object.entries(data)) {
    updates.push(prisma.setting.upsert({
      where: { key }, update: { value: String(value) }, create: { key, value: String(value) }
    }));
  }
  await Promise.all(updates);
  return NextResponse.json({ success: true });
}