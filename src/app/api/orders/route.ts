import { NextRequest, NextResponse } from 'next/server';
import { d1All, d1First, d1Run } from '@/lib/d1';

function genId() {
  return 'o_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}
function genItemId() {
  return 'oi_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function POST(req: NextRequest) {
  const data = await req.json() as any;
  if (!data.items || data.items.length === 0) {
    return NextResponse.json({ error: 'ตะกร้าว่าง' }, { status: 400 });
  }
  if (!data.customerName || !data.customerPhone || !data.address) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
  }

  const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();
  const id = genId();
  const now = new Date().toISOString();

  await d1Run(
    `INSERT INTO \`Order\`
     (id, orderNumber, userId, customerName, customerEmail, customerPhone, address, province,
      total, shipping, discount, status, paymentMethod, note, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 'pending', ?, ?, ?, ?)`,
    [
      id, orderNumber,
      data.userId || null,
      data.customerName,
      data.customerEmail || null,
      data.customerPhone,
      data.address,
      data.province || null,
      Number(data.total) || 0,
      Number(data.shipping) || 0,
      data.paymentMethod || null,
      data.note || null,
      now, now
    ]
  );

  // Insert items one-by-one. D1 doesn't expose multi-statement transactions
  // through prepare()/run() so this is the safe path.
  for (const it of data.items as any[]) {
    await d1Run(
      `INSERT INTO OrderItem (id, orderId, productId, name, price, quantity, subtotal)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        genItemId(),
        id,
        it.productId,
        it.name,
        Number(it.price) || 0,
        parseInt(it.quantity) || 1,
        (Number(it.price) || 0) * (parseInt(it.quantity) || 1)
      ]
    );
  }

  return NextResponse.json({ success: true, orderId: id, orderNumber });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    const order = await d1First<any>('SELECT * FROM `Order` WHERE id = ? OR orderNumber = ?', [id, id]);
    if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    const items = await d1All<any>('SELECT * FROM OrderItem WHERE orderId = ?', [order.id]);
    return NextResponse.json({ order: { ...order, items } });
  }
  return NextResponse.json({ error: 'Missing id' }, { status: 400 });
}