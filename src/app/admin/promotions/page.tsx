import { prisma, ensurePrisma } from '@/lib/prisma';
import PromotionsManager from './PromotionsManager';

export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage() {
  try {
    const prisma = await ensurePrisma();
    const items = await prisma.promotion.findMany({ orderBy: { sortOrder: 'asc' } });
    return <PromotionsManager promotions={items as any} />;
  } catch (err: any) {
    return <div className="p-6 text-red-600">Promotions error: {String(err?.message || err)}</div>;
  }
}