import { NextRequest, NextResponse } from 'next/server';
import { register } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const u = await register(data);
    return NextResponse.json({ success: true, user: { id: u.id, name: u.name, email: u.email, role: u.role } });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 400 });
  }
}