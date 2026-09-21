import { getCurrentUser } from '@/lib/auth';
import { d1All } from '@/lib/d1';
import { redirect } from 'next/navigation';
import { statusLabel, statusColor, priceFormat } from '@/lib/settings';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function OrdersPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account/orders');

  const orderRows = await d1All<any>('SELECT id, orderNumber, total, shipping, status, createdAt FROM `Order` WHERE userId = ? ORDER BY createdAt DESC', [user.id]);
  const items = orderRows.length ? await d1All<any>('SELECT orderId, name, price, quantity, subtotal FROM OrderItem WHERE orderId IN (' + orderRows.map(() => '?').join(',') + ')', orderRows.map((o: any) => o.id)) : [];
  const byOrder: Record<string, any[]> = {};
  for (const it of items) {
    if (!byOrder[it.orderId]) byOrder[it.orderId] = [];
    byOrder[it.orderId].push(it);
  }
  const orders = orderRows.map(o => ({ ...o, items: byOrder[o.id] || [] }));

  return (
    <div className="max-w-5xl mx-auto px-3 py-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">รายการสั่งซื้อของฉัน</h1>

      {orders.length === 0 ? (
        <div className="bg-white rounded-lg shadow-card p-10 text-center">
          <div className="text-6xl mb-2">📦</div>
          <p className="text-gray-500 mb-4">ยังไม่มีคำสั่งซื้อ</p>
          <Link href="/products" className="inline-block bg-brand-600 text-white px-6 py-2 rounded hover:bg-brand-700">เลือกซื้อสินค้า</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map(o => (
            <div key={o.id} className="bg-white rounded-lg shadow-card p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3 pb-3 border-b">
                <div>
                  <div className="font-mono text-sm font-bold">#{o.orderNumber}</div>
                  <div className="text-xs text-gray-500">{new Date(o.createdAt).toLocaleString('th-TH')}</div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColor(o.status)}`}>
                  {statusLabel(o.status)}
                </span>
              </div>
              <div className="space-y-2">
                {o.items.map(it => (
                  <div key={it.id} className="flex gap-2 text-sm">
                    <div className="flex-1">{it.name} <span className="text-gray-500">x{it.quantity}</span></div>
                    <div className="font-semibold">฿{priceFormat(it.subtotal)}</div>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t flex justify-between items-center">
                <span className="text-sm text-gray-500">รวม {o.items.reduce((s, i) => s + i.quantity, 0)} ชิ้น</span>
                <span className="font-bold text-lg text-brand-600">฿{priceFormat(o.total)}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}