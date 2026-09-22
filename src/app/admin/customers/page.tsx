import { d1All } from '@/lib/d1';
import CustomersManager from './CustomersManager';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const users = await d1All<any>('SELECT id, email, name, phone, role, address, province, postalCode, createdAt FROM User ORDER BY createdAt DESC');
  const orders = await d1All<any>('SELECT userId FROM `Order`');
  const countMap: Record<string, number> = {};
  for (const oc of orders) if (oc.userId) countMap[oc.userId] = (countMap[oc.userId] || 0) + 1;
  return <CustomersManager users={users} orderCounts={countMap} />;
}