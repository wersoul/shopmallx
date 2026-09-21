import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const data = await req.json() as any;
  console.log('📩 Contact form submission:', data);
  return NextResponse.json({ success: true });
}