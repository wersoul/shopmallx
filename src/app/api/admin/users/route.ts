import { NextRequest, NextResponse } from 'next/server';
import { d1All, d1First, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';
import { hashPassword } from '@/lib/password';

function genId() {
  return 'u_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const users = await d1All<any>(
    'SELECT id, email, name, phone, role, address, province, postalCode, createdAt FROM User ORDER BY createdAt DESC'
  );
  return NextResponse.json({ users });
}

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  if (!data.email || !data.name) return NextResponse.json({ error: 'email และ name จำเป็น' }, { status: 400 });
  if (!data.password || String(data.password).length < 6) {
    return NextResponse.json({ error: 'รหัสผ่านต้องอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
  }
  const exists = await d1First<any>('SELECT id FROM User WHERE email = ?', [String(data.email).toLowerCase()]);
  if (exists) return NextResponse.json({ error: 'Email นี้ถูกใช้งานแล้ว' }, { status: 400 });
  const id = genId();
  const hash = await hashPassword(String(data.password));
  const now = new Date().toISOString();
  await d1Run(
    `INSERT INTO User (id, email, password, name, phone, role, address, province, postalCode, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      String(data.email).toLowerCase(),
      hash,
      data.name,
      data.phone || null,
      data.role === 'admin' ? 'admin' : 'customer',
      data.address || null,
      data.province || null,
      data.postalCode || null,
      now, now
    ]
  );
  const user = await d1First<any>(
    'SELECT id, email, name, phone, role, address, province, postalCode, createdAt FROM User WHERE id = ?', [id]
  );
  return NextResponse.json({ success: true, user });
}