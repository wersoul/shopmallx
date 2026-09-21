import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json() as { email: string; password: string };
    const u = await login(email, password);
    if (!u) return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    return NextResponse.json({ success: true, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch (err: any) {
    return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
  }
}