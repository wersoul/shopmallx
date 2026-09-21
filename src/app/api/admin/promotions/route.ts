import { NextRequest, NextResponse } from 'next/server';
import { d1All, d1First, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

function genId() {
  return 'pr_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function GET() {
  const promotions = await d1All<any>('SELECT * FROM Promotion ORDER BY sortOrder ASC');
  return NextResponse.json({ promotions });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  if (!data.title) return NextResponse.json({ error: 'title จำเป็น' }, { status: 400 });
  const id = genId();
  const now = new Date().toISOString();
  await d1Run(
    `INSERT INTO Promotion (id, title, description, image, badge, link, sortOrder, isActive, createdAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      data.title,
      data.description || null,
      data.image || null,
      data.badge || null,
      data.link || null,
      parseInt(data.sortOrder) || 0,
      data.isActive === false ? 0 : 1,
      now
    ]
  );
  const promotion = await d1First<any>('SELECT * FROM Promotion WHERE id = ?', [id]);
  return NextResponse.json({ success: true, promotion });
}