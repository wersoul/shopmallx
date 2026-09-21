import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/login?redirect=/account');

  const ordersCount = await prisma.order.count({ where: { userId: user.id } });
  const pendingCount = await prisma.order.count({ where: { userId: user.id, status: 'pending' } });

  return (
    <div className="max-w-5xl mx-auto px-3 py-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">บัญชีของฉัน</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow-card p-4 md:col-span-1">
          <div className="w-20 h-20 bg-brand-100 rounded-full mx-auto flex items-center justify-center text-3xl text-brand-600 font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="text-center mt-3">
            <div className="font-bold">{user.name}</div>
            <div className="text-sm text-gray-500">{user.email}</div>
            <div className="text-xs text-gray-400 mt-1">{user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'ลูกค้า'}</div>
          </div>
          <div className="mt-4 border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between"><span>เบอร์โทร:</span><span>{user.phone || '-'}</span></div>
            <div className="flex justify-between"><span>สมัครเมื่อ:</span><span>{new Date(user.createdAt).toLocaleDateString('th-TH')}</span></div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-lg shadow-card p-4">
              <div className="text-sm text-gray-500">คำสั่งซื้อทั้งหมด</div>
              <div className="text-3xl font-bold text-brand-600">{ordersCount}</div>
              <Link href="/account/orders" className="text-xs text-brand-600 hover:underline">ดูทั้งหมด →</Link>
            </div>
            <div className="bg-white rounded-lg shadow-card p-4">
              <div className="text-sm text-gray-500">รอชำระเงิน</div>
              <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
              <Link href="/account/orders" className="text-xs text-brand-600 hover:underline">ดูรายการ →</Link>
            </div>
          </div>

          <Link href="/account/orders" className="block bg-white rounded-lg shadow-card p-4 hover:shadow-lg">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold">📦 รายการสั่งซื้อ</div>
                <div className="text-sm text-gray-500">ดูประวัติการสั่งซื้อทั้งหมด</div>
              </div>
              <span className="text-brand-600">→</span>
            </div>
          </Link>

          {user.role === 'admin' && (
            <Link href="/admin" className="block bg-brand-600 text-white rounded-lg shadow-card p-4 hover:bg-brand-700">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold">⚙ หลังบ้าน (Admin)</div>
                  <div className="text-sm opacity-90">จัดการสินค้า คำสั่งซื้อ ลูกค้า และอื่นๆ</div>
                </div>
                <span>→</span>
              </div>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}