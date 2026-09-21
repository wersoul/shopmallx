import { prisma } from '@/lib/prisma';
import CategoriesManager from './CategoriesManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const cats = await prisma.category.findMany({ orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }] });
  return <CategoriesManager categories={cats} />;
}