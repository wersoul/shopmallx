import { prisma } from '@/lib/prisma';
import PromotionsManager from './PromotionsManager';

export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage() {
  const items = await prisma.promotion.findMany({ orderBy: { sortOrder: 'asc' } });
  return <PromotionsManager promotions={items} />;
}