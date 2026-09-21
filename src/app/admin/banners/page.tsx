import { prisma, ensurePrisma } from '@/lib/prisma';
import BannersManager from './BannersManager';

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  const prisma = await ensurePrisma();
  const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  return <BannersManager banners={banners} />;
}