import { d1All, d1First } from '@/lib/d1';
import Link from 'next/link';
import { priceFormat } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
  const [pRow, oRow, uRow, revRow] = await Promise.all([
    d1First<{ c: number }>('SELECT COUNT(*) AS c FROM Product'),
    d1First<{ c: number }>('SELECT COUNT(*) AS c FROM `Order`'),
    d1First<{ c: number }>("SELECT COUNT(*) AS c FROM User WHERE role = 'customer'"),
    d1First<{ s: number }>("SELECT COALESCE(SUM(total), 0) AS s FROM `Order` WHERE status IN ('verified','shipping','completed')")
  ]);
  const products = pRow?.c ?? 0;
  const orders = oRow?.c ?? 0;
  const users = uRow?.c ?? 0;
  const totalRevenue = revRow?.s ?? 0;

  const recentRaw = await d1All<any>(
    `SELECT o.id, o.orderNumber, o.customerName, o.total, o.status, o.createdAt, u.name as userName
     FROM \`Order\` o LEFT JOIN User u ON o.userId = u.id
     ORDER BY o.createdAt DESC LIMIT 5`
  );
  const recent = recentRaw.map(r => ({ ...r, user: { name: r.userName } }));

  const stats = [
    { label: 'สินค้าทั้งหมด', value: products, color: 'bg-blue-500', icon: '📦', link: '/admin/products' },
    { label: 'คำสั่งซื้อ', value: orders, color: 'bg-green-500', icon: '🛒', link: '/admin/orders' },
    { label: 'ลูกค้า', value: users, color: 'bg-purple-500', icon: '👥', link: '/admin/customers' },
    { label: 'ยอดขายรวม', value: '฿' + priceFormat(totalRevenue || 0), color: 'bg-brand-500', icon: '💰', link: '/admin/orders' }
  ];

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg shadow-card p-4">
        <h1 className="text-2xl font-bold">📊 Dashboard</h1>
        <p className="text-sm text-gray-500">ภาพรวมระบบร้านค้า</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map(s => (
          <Link key={s.label} href={s.link} className="bg-white rounded-lg shadow-card p-4 hover:shadow-lg">
            <div className={`${s.color} text-white w-10 h-10 rounded-full flex items-center justify-center text-xl mb-2`}>{s.icon}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
            <div className="text-2xl font-bold">{s.value}</div>
          </Link>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-card p-4">
        <h2 className="font-bold mb-3">คำสั่งซื้อล่าสุด</h2>
        {recent.length === 0 ? (
          <p className="text-gray-500 text-sm text-center py-4">ยังไม่มีคำสั่งซื้อ</p>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase">
              <tr>
                <th className="text-left px-3 py-2">เลขที่</th>
                <th className="text-left px-3 py-2">ลูกค้า</th>
                <th className="text-right px-3 py-2">ยอด</th>
                <th className="text-center px-3 py-2">สถานะ</th>
              </tr>
            </thead>
            <tbody>
              {recent.map(o => (
                <tr key={o.id} className="border-t">
                  <td className="px-3 py-2 font-mono">{o.orderNumber}</td>
                  <td className="px-3 py-2">{o.customerName}</td>
                  <td className="px-3 py-2 text-right">฿{priceFormat(o.total)}</td>
                  <td className="px-3 py-2 text-center">{o.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}