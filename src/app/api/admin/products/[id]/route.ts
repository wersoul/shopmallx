import { NextRequest, NextResponse } from 'next/server';
import { d1First, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

function slugify(s: string) {
  return (s || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const now = new Date().toISOString();
  const updates: string[] = [];
  const binds: any[] = [];

  const setField = (col: string, val: any) => { updates.push(`${col} = ?`); binds.push(val); };

  if (data.name != null) {
    setField('name', data.name);
    if (data.slug == null) setField('slug', slugify(data.name));
  }
  if (data.slug != null) setField('slug', slugify(data.slug));
  if (data.description != null) setField('description', data.description);
  if (data.price != null) setField('price', parseFloat(data.price) || 0);
  if (data.salePrice !== undefined) setField('salePrice', data.salePrice ? parseFloat(data.salePrice) : null);
  if (data.stock != null) setField('stock', parseInt(data.stock) || 0);
  if (data.images != null) setField('images', JSON.stringify(data.images));
  if (data.brand !== undefined) setField('brand', data.brand || null);
  if (data.isActive != null) setField('isActive', data.isActive ? 1 : 0);
  if (data.isFeatured != null) setField('isFeatured', data.isFeatured ? 1 : 0);
  if (data.isNew != null) setField('isNew', data.isNew ? 1 : 0);
  if (data.categoryId != null) setField('categoryId', data.categoryId);
  if (data.subCategoryId !== undefined) setField('subCategoryId', data.subCategoryId || null);
  setField('updatedAt', now);

  if (updates.length === 1) return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
  binds.push(params.id);
  await d1Run(`UPDATE Product SET ${updates.join(', ')} WHERE id = ?`, binds);
  const product = await d1First<any>('SELECT * FROM Product WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true, product });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  await d1Run('DELETE FROM Product WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true });
}