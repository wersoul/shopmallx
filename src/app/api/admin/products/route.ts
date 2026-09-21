import { NextRequest, NextResponse } from 'next/server';
import { d1All, d1First, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

function genId() {
  return 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function slugify(s: string) {
  return (s || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80);
}

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const products = await d1All<any>(
    `SELECT p.*, c.name as categoryName, sc.name as subCategoryName
     FROM Product p
     LEFT JOIN Category c ON p.categoryId = c.id
     LEFT JOIN Category sc ON p.subCategoryId = sc.id
     ORDER BY p.createdAt DESC`
  );
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  if (!data.name || !data.categoryId) return NextResponse.json({ error: 'name และ categoryId จำเป็น' }, { status: 400 });
  const id = genId();
  const slug = data.slug && data.slug.trim() ? slugify(data.slug) : slugify(data.name);
  const now = new Date().toISOString();
  await d1Run(
    `INSERT INTO Product
     (id, name, slug, description, price, salePrice, stock, images, brand,
      isActive, isFeatured, isNew, categoryId, subCategoryId, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id, data.name, slug || id,
      data.description || '',
      parseFloat(data.price) || 0,
      data.salePrice ? parseFloat(data.salePrice) : null,
      parseInt(data.stock) || 0,
      JSON.stringify(data.images || []),
      data.brand || null,
      data.isActive === false ? 0 : 1,
      data.isFeatured ? 1 : 0,
      data.isNew ? 1 : 0,
      data.categoryId,
      data.subCategoryId || null,
      now, now
    ]
  );
  const product = await d1First<any>('SELECT * FROM Product WHERE id = ?', [id]);
  return NextResponse.json({ success: true, product });
}