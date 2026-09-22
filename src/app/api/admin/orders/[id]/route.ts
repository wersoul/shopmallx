import { NextRequest, NextResponse } from 'next/server';
import { d1All, d1First, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

function genItemId() {
  return 'oi_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;

  // Order header fields
  const updates: string[] = [];
  const binds: any[] = [];
  const set = (col: string, val: any) => { updates.push(`${col} = ?`); binds.push(val); };

  if (data.status != null) set('status', data.status);
  if (data.note !== undefined) set('note', data.note || null);
  if (data.paymentSlip !== undefined) set('paymentSlip', data.paymentSlip || null);
  if (data.customerName != null) set('customerName', String(data.customerName).trim());
  if (data.customerPhone != null) set('customerPhone', String(data.customerPhone).trim());
  if (data.customerEmail !== undefined) set('customerEmail', data.customerEmail || null);
  if (data.address != null) set('address', String(data.address).trim());
  if (data.province !== undefined) set('province', data.province || null);
  if (data.paymentMethod !== undefined) set('paymentMethod', data.paymentMethod || null);
  if (data.shipping != null) set('shipping', Number(data.shipping) || 0);
  if (data.discount != null) set('discount', Number(data.discount) || 0);

  // Items array: when provided, fully replace (delete + re-insert).
  // Doing a clean replacement keeps the math correct and avoids stale rows.
  let items: any[] | undefined;
  if (Array.isArray(data.items)) {
    items = data.items.map((it: any) => {
      const price = Number(it.price) || 0;
      const quantity = Math.max(1, parseInt(String(it.quantity)) || 1);
      return {
        name: String(it.name || '').trim() || 'สินค้า',
        price,
        quantity,
        subtotal: price * quantity,
        productId: it.productId || null
      };
    });
    // Recompute total = sum(item subtotal) + shipping - discount
    const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
    const shipping = Number(data.shipping ?? data.shippingKeep) || 0;
    const discount = Number(data.discount ?? data.discountKeep) || 0;
    set('total', subtotal + shipping - discount);
  }

  set('updatedAt', new Date().toISOString());

  if (updates.length) {
    binds.push(params.id);
    await d1Run(`UPDATE \`Order\` SET ${updates.join(', ')} WHERE id = ?`, binds);
  }

  if (items) {
    // Wipe + re-insert. D1 has no multi-statement tx, but this is a small
    // bounded number of writes per order so it's safe enough.
    await d1Run('DELETE FROM OrderItem WHERE orderId = ?', [params.id]);
    for (const it of items) {
      await d1Run(
        `INSERT INTO OrderItem (id, orderId, productId, name, price, quantity, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          genItemId(),
          params.id,
          it.productId,
          it.name,
          it.price,
          it.quantity,
          it.subtotal
        ]
      );
    }
  }

  const order = await d1First<any>('SELECT * FROM `Order` WHERE id = ?', [params.id]);
  const orderItems = await d1All<any>('SELECT id, name, price, quantity, subtotal FROM OrderItem WHERE orderId = ?', [params.id]);
  return NextResponse.json({ success: true, order: { ...order, items: orderItems } });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  // OrderItems have FK ON DELETE CASCADE so the children go with it.
  await d1Run('DELETE FROM `Order` WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true });
}