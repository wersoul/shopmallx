import { prisma, ensurePrisma } from '@/lib/prisma';
import BannersManager from './BannersManager';

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  try {
    const prisma = await ensurePrisma();
    const banners = await prisma.banner.findMany({ orderBy: { sortOrder: 'asc' } });
    return <BannersManager banners={banners as any} />;
  } catch (err: any) {
    return <div className="p-6 text-red-600">Banners error: {String(err?.message || err)}</div>;
  }
}