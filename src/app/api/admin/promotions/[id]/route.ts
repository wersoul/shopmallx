import { NextRequest, NextResponse } from 'next/server';
import { d1First, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const updates: string[] = [];
  const binds: any[] = [];
  const set = (col: string, val: any) => { updates.push(`${col} = ?`); binds.push(val); };

  if (data.title != null) set('title', data.title);
  if (data.description !== undefined) set('description', data.description || null);
  if (data.image !== undefined) set('image', data.image || null);
  if (data.badge !== undefined) set('badge', data.badge || null);
  if (data.link !== undefined) set('link', data.link || null);
  if (data.sortOrder != null) set('sortOrder', parseInt(data.sortOrder) || 0);
  if (data.isActive != null) set('isActive', data.isActive ? 1 : 0);

  if (!updates.length) return NextResponse.json({ error: 'no fields to update' }, { status: 400 });
  binds.push(params.id);
  await d1Run(`UPDATE Promotion SET ${updates.join(', ')} WHERE id = ?`, binds);
  const promotion = await d1First<any>('SELECT * FROM Promotion WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true, promotion });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  await d1Run('DELETE FROM Promotion WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true });
}