import { NextRequest, NextResponse } from 'next/server';
import { d1All, d1First, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

function genId() {
  return 'c_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function slugify(s: string) {
  return (s || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80);
}

export async function GET() {
  const categories = await d1All<any>('SELECT * FROM Category ORDER BY parentId ASC, sortOrder ASC');
  return NextResponse.json({ categories });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  if (!data.name) return NextResponse.json({ error: 'name จำเป็น' }, { status: 400 });
  const id = genId();
  const slug = data.slug && data.slug.trim() ? slugify(data.slug) : slugify(data.name);
  const now = new Date().toISOString();
  await d1Run(
    `INSERT INTO Category (id, name, slug, description, image, parentId, sortOrder, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, data.name, slug || id,
      data.description || null,
      data.image || null,
      data.parentId || null,
      parseInt(data.sortOrder) || 0,
      data.isActive === false ? 0 : 1,
      now
    ]
  );
  const category = await d1First<any>('SELECT * FROM Category WHERE id = ?', [id]);
  return NextResponse.json({ success: true, category });
}