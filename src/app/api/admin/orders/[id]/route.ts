import { NextRequest, NextResponse } from 'next/server';
import { d1First, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const updates: string[] = [];
  const binds: any[] = [];
  const set = (col: string, val: any) => { updates.push(`${col} = ?`); binds.push(val); };

  if (data.status != null) set('status', data.status);
  if (data.note !== undefined) set('note', data.note || null);
  if (data.paymentSlip !== undefined) set('paymentSlip', data.paymentSlip || null);
  set('updatedAt', new Date().toISOString());

  binds.push(params.id);
  await d1Run(`UPDATE \`Order\` SET ${updates.join(', ')} WHERE id = ?`, binds);
  const order = await d1First<any>('SELECT * FROM `Order` WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true, order });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  // OrderItems have FK ON DELETE CASCADE so the children go with it.
  await d1Run('DELETE FROM `Order` WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true });
}