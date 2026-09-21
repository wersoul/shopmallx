import { d1All } from '@/lib/d1';
import CategoriesManager from './CategoriesManager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const cats = await d1All<any>('SELECT id, name, slug, parentId, sortOrder, isActive FROM Category ORDER BY parentId ASC, sortOrder ASC');
  return <CategoriesManager categories={cats as any} />;
}