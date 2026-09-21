import { NextRequest, NextResponse } from 'next/server';
import { login } from '@/lib/auth';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  console.log('[login.route] POST start');
  try {
    const body = await req.json();
    console.log('[login.route] body:', body);
    const { email, password } = body as { email: string; password: string };
    const u = await login(email, password);
    console.log('[login.route] result:', !!u);
    if (!u) return NextResponse.json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' }, { status: 401 });
    return NextResponse.json({ success: true, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch (err: any) {
    console.log('[login.route] error:', err?.message);
    return NextResponse.json({ error: String(err?.message || err), stack: err?.stack?.split('\n').slice(0, 5) }, { status: 500 });
  }
}