import { d1All, serialize } from '@/lib/d1';
import OrdersManager from './OrdersManager';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await d1All<any>(
    `SELECT o.id, o.orderNumber, o.customerName, o.customerEmail, o.customerPhone, o.address, o.total, o.shipping, o.discount, o.status, o.createdAt,
            u.name as userName, u.email as userEmail
     FROM \`Order\` o LEFT JOIN User u ON o.userId = u.id
     ORDER BY o.createdAt DESC`
  );
  const items = await d1All<any>('SELECT orderId, name, price, quantity, subtotal FROM OrderItem');
  const byOrder: Record<string, any[]> = {};
  for (const it of items) {
    if (!byOrder[it.orderId]) byOrder[it.orderId] = [];
    byOrder[it.orderId].push(it);
  }
  const enriched = orders.map(o => ({ ...o, items: byOrder[o.id] || [] }));
  return <OrdersManager orders={serialize(enriched) as any} />;
}