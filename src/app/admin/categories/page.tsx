import { prisma, ensurePrisma } from '@/lib/prisma';
import CategoriesManager from './CategoriesManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  try {
    const prisma = await ensurePrisma();
    const cats = await prisma.category.findMany({ orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }] });
    return <CategoriesManager categories={cats as any} />;
  } catch (err: any) {
    return <div style={{padding:40, color:'red'}}>CATEGORIES ERR: {String(err?.message || err)}</div>;
  }
}