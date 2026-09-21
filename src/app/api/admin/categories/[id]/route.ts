import { NextRequest, NextResponse } from 'next/server';
import { d1First, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

function slugify(s: string) {
  return (s || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const updates: string[] = [];
  const binds: any[] = [];
  const set = (col: string, val: any) => { updates.push(`${col} = ?`); binds.push(val); };

  if (data.name != null) {
    set('name', data.name);
    if (data.slug == null) set('slug', slugify(data.name));
  }
  if (data.slug != null) set('slug', slugify(data.slug));
  if (data.description !== undefined) set('description', data.description || null);
  if (data.image !== undefined) set('image', data.image || null);
  if (data.parentId !== undefined) set('parentId', data.parentId || null);
  if (data.sortOrder != null) set('sortOrder', parseInt(data.sortOrder) || 0);
  if (data.isActive != null) set('isActive', data.isActive ? 1 : 0);

  if (!updates.length) return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
  binds.push(params.id);
  await d1Run(`UPDATE Category SET ${updates.join(', ')} WHERE id = ?`, binds);
  const category = await d1First<any>('SELECT * FROM Category WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true, category });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  // Detach children first so the FK ON DELETE SET NULL can do its job cleanly.
  await d1Run('UPDATE Category SET parentId = NULL WHERE parentId = ?', [params.id]);
  await d1Run('DELETE FROM Category WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true });
}