import { NextRequest, NextResponse } from 'next/server';
import { d1All, d1First, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

function genId() {
  return 's_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function GET() {
  const settings = await d1All<any>('SELECT id, key, value FROM Setting');
  return NextResponse.json({ settings });
}

export async function PUT(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const now = new Date().toISOString();
  for (const [key, value] of Object.entries(data)) {
    const existing = await d1First<any>('SELECT id FROM Setting WHERE key = ?', [key]);
    if (existing) {
      await d1Run('UPDATE Setting SET value = ?, updatedAt = ? WHERE id = ?', [String(value), now, existing.id]);
    } else {
      await d1Run('INSERT INTO Setting (id, key, value, updatedAt) VALUES (?, ?, ?, ?)', [genId(), key, String(value), now]);
    }
  }
  return NextResponse.json({ success: true });
}