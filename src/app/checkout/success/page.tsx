import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function SuccessPage({ searchParams }: { searchParams: { id?: string } }) {
  const order = searchParams.id ? await prisma.order.findUnique({
    where: { id: searchParams.id },
    include: { items: true }
  }) : null;

  return (
    <div className="max-w-2xl mx-auto px-3 py-10 text-center">
      <div className="bg-white rounded-lg shadow-card p-8">
        <div className="w-20 h-20 bg-green-100 rounded-full mx-auto flex items-center justify-center text-4xl text-green-600 mb-4">✓</div>
        <h1 className="text-2xl font-bold mb-2">สั่งซื้อสำเร็จ!</h1>
        <p className="text-gray-500 mb-4">ขอบคุณสำหรับการสั่งซื้อ เราจะตรวจสอบและจัดส่งโดยเร็วที่สุด</p>
        {order && (
          <div className="bg-gray-50 rounded-lg p-4 text-left text-sm">
            <div className="flex justify-between"><span>เลขที่คำสั่งซื้อ:</span><span className="font-mono font-bold">{order.orderNumber}</span></div>
            <div className="flex justify-between mt-1"><span>ยอดรวม:</span><span className="font-bold text-brand-600">฿{order.total.toLocaleString()}</span></div>
            <div className="flex justify-between mt-1"><span>สถานะ:</span><span className="text-yellow-600 font-semibold">รอชำระเงิน</span></div>
          </div>
        )}
        <div className="mt-6 flex gap-2 justify-center">
          <Link href="/account/orders" className="bg-brand-600 text-white px-5 py-2 rounded hover:bg-brand-700">ดูคำสั่งซื้อ</Link>
          <Link href="/products" className="border border-brand-600 text-brand-600 px-5 py-2 rounded hover:bg-brand-50">เลือกซื้อต่อ</Link>
        </div>
      </div>
    </div>
  );
}