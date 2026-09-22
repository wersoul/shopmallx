import { d1All, serialize } from '@/lib/d1';
import OrdersManager from './OrdersManager';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await d1All<any>(
    `SELECT o.id, o.orderNumber, o.customerName, o.customerEmail, o.customerPhone, o.address, o.province, o.postalCode, o.total, o.shipping, o.discount, o.status, o.createdAt,
            u.name as userName, u.email as userEmail, u.province as userProvince, u.postalCode as userPostalCode
     FROM \`Order\` o LEFT JOIN User u ON o.userId = u.id
     ORDER BY o.createdAt DESC`
  );
  const items = await d1All<any>('SELECT id, orderId, productId, name, price, quantity, subtotal FROM OrderItem');
  const byOrder: Record<string, any[]> = {};
  for (const it of items) {
    if (!byOrder[it.orderId]) byOrder[it.orderId] = [];
    byOrder[it.orderId].push(it);
  }
  // Fall back to the registered user's address fields if the order itself
  // didn't capture them at checkout time — common for older orders.
  const enriched = orders.map(o => ({
    ...o,
    province: o.province || o.userProvince || '',
    postalCode: o.postalCode || o.userPostalCode || '',
    items: byOrder[o.id] || []
  }));

  // Pull active products for the "+ เพิ่มรายการ" autocomplete datalist.
  // Limit so the page bundle doesn't balloon if the catalog grows huge.
  const products = await d1All<any>(
    `SELECT id, name, price, salePrice FROM Product WHERE isActive = 1 ORDER BY name ASC LIMIT 500`
  );

  return (
    <OrdersManager
      orders={serialize(enriched) as any}
      products={serialize(products) as any}
    />
  );
}