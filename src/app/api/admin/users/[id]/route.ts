import { NextRequest, NextResponse } from 'next/server';
import { d1First, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  const updates: string[] = [];
  const binds: any[] = [];
  const set = (col: string, val: any) => { updates.push(`${col} = ?`); binds.push(val); };

  if (data.email != null) set('email', String(data.email).toLowerCase());
  if (data.name != null) set('name', data.name);
  if (data.phone !== undefined) set('phone', data.phone || null);
  if (data.address !== undefined) set('address', data.address || null);
  if (data.role != null && (data.role === 'admin' || data.role === 'customer')) {
    set('role', data.role);
  }
  if (data.password && String(data.password).length >= 6) {
    set('password', await hashPassword(String(data.password)));
  } else if (data.password) {
    return NextResponse.json({ error: 'รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
  }
  set('updatedAt', new Date().toISOString());

  binds.push(params.id);
  await d1Run(`UPDATE User SET ${updates.join(', ')} WHERE id = ?`, binds);
  const user = await d1First<any>(
    'SELECT id, email, name, phone, role, address, createdAt FROM User WHERE id = ?', [params.id]
  );
  return NextResponse.json({ success: true, user });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  // Detach orders so the FK ON DELETE SET NULL can fire without surprises.
  await d1Run('UPDATE `Order` SET userId = NULL WHERE userId = ?', [params.id]);
  await d1Run('DELETE FROM User WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true });
}