import { NextRequest, NextResponse } from 'next/server';
import { d1All, d1First, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

function genId() {
  return 'cn_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function GET() {
  const contents = await d1All<any>('SELECT * FROM Content');
  return NextResponse.json({ contents });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  if (!data.key) return NextResponse.json({ error: 'key จำเป็น' }, { status: 400 });
  const now = new Date().toISOString();
  const existing = await d1First<any>('SELECT id FROM Content WHERE key = ?', [data.key]);
  if (existing) {
    await d1Run('UPDATE Content SET title = ?, body = ?, updatedAt = ? WHERE id = ?',
      [data.title || '', data.body || '', now, existing.id]);
  } else {
    await d1Run('INSERT INTO Content (id, key, title, body, updatedAt) VALUES (?, ?, ?, ?, ?)',
      [genId(), data.key, data.title || '', data.body || '', now]);
  }
  const content = await d1First<any>('SELECT * FROM Content WHERE key = ?', [data.key]);
  return NextResponse.json({ success: true, content });
}