import { NextRequest, NextResponse } from 'next/server';
import { d1All, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  const banners = await d1All<any>('SELECT id, title, subtitle, image, link, position, sortOrder, isActive FROM Banner ORDER BY sortOrder ASC');
  return NextResponse.json({ banners });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const id = 'b_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
  await d1Run(
    'INSERT INTO Banner (id, title, subtitle, image, link, position, sortOrder, isActive, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',
    [id, data.title, data.subtitle || null, data.image, data.link || null, data.position || 'hero', data.sortOrder || 0, data.isActive ? 1 : 0, new Date().toISOString()]
  );
  const banner = { id, ...data };
  return NextResponse.json({ success: true, banner });
}