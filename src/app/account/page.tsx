import { getCurrentUser } from '@/lib/auth';
import { d1First } from '@/lib/d1';
import { redirect } from 'next/navigation';
import AccountEditor from './AccountEditor';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account');

  const ordersRow = await d1First<{ c: number }>('SELECT COUNT(*) AS c FROM `Order` WHERE userId = ?', [user.id]);
  const pendingRow = await d1First<{ c: number }>("SELECT COUNT(*) AS c FROM `Order` WHERE userId = ? AND status = 'pending'", [user.id]);
  const ordersCount = ordersRow?.c ?? 0;
  const pendingCount = pendingRow?.c ?? 0;

  return (
    <AccountEditor
      user={{
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        address: user.address || '',
        createdAt: user.createdAt
      }}
      ordersCount={ordersCount}
      pendingCount={pendingCount}
    />
  );
}