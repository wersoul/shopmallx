import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: { id: true, email: true, name: true, phone: true, role: true, address: true, createdAt: true, _count: { select: { orders: true } } }
  });
  return (
    <div>
      <div className="bg-white rounded-lg shadow-card p-4 mb-3">
        <h1 className="text-2xl font-bold">👥 จัดการลูกค้า</h1>
        <p className="text-sm text-gray-500">สมาชิก {users.filter(u => u.role === 'customer').length} คน</p>
      </div>
      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">ชื่อ</th>
              <th className="text-left px-3 py-2">อีเมล</th>
              <th className="text-left px-3 py-2">โทร</th>
              <th className="text-center px-3 py-2">ระดับ</th>
              <th className="text-center px-3 py-2">คำสั่งซื้อ</th>
              <th className="text-center px-3 py-2">สมัครเมื่อ</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{u.name}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.phone || '-'}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.role === 'admin' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-700'}`}>
                    {u.role === 'admin' ? 'แอดมิน' : 'ลูกค้า'}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">{(u as any)._count?.orders || 0}</td>
                <td className="px-3 py-2 text-center text-xs">{new Date(u.createdAt).toLocaleDateString('th-TH')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}