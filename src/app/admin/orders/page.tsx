import { prisma, ensurePrisma } from '@/lib/prisma';
import OrdersManager from './OrdersManager';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const prisma = await ensurePrisma();
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true, user: { select: { name: true, email: true } } }
  });
  return <OrdersManager orders={orders} />;
}