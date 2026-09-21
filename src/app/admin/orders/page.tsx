import { prisma, ensurePrisma } from '@/lib/prisma';
import OrdersManager from './OrdersManager';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  try {
    const prisma = await ensurePrisma();
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: 'desc' },
      include: { items: true, user: { select: { name: true, email: true } } }
    });
    return <OrdersManager orders={orders as any} />;
  } catch (err: any) {
    return <div className="p-6 text-red-600">Orders error: {String(err?.message || err)}</div>;
  }
}