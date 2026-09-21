import { NextRequest, NextResponse } from 'next/server';
import { d1All } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

export async function GET() {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const orders = await d1All<any>(
    `SELECT o.id, o.orderNumber, o.customerName, o.total, o.status, o.createdAt, u.name as userName, u.email as userEmail
     FROM \`Order\` o LEFT JOIN User u ON o.userId = u.id
     ORDER BY o.createdAt DESC`
  );
  return NextResponse.json({ orders });
}