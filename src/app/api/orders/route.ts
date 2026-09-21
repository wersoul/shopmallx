import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const data = await req.json();
  if (!data.items || data.items.length === 0) {
    return NextResponse.json({ error: 'ตะกร้าว่าง' }, { status: 400 });
  }
  if (!data.customerName || !data.customerPhone || !data.address) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
  }

  const orderNumber = 'ORD-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

  const order = await prisma.order.create({
    data: {
      orderNumber,
      userId: data.userId || null,
      customerName: data.customerName,
      customerEmail: data.customerEmail || null,
      customerPhone: data.customerPhone,
      address: data.address,
      province: data.province || null,
      total: data.total,
      shipping: data.shipping,
      paymentMethod: data.paymentMethod,
      note: data.note || null,
      items: {
        create: data.items.map((it: any) => ({
          productId: it.productId,
          name: it.name,
          price: it.price,
          quantity: it.quantity,
          subtotal: it.price * it.quantity
        }))
      }
    }
  });

  return NextResponse.json({ success: true, orderId: order.id });
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (id) {
    const order = await prisma.order.findUnique({ where: { id }, include: { items: true } });
    return NextResponse.json({ order });
  }
  return NextResponse.json({ error: 'Missing id' }, { status: 400 });
}