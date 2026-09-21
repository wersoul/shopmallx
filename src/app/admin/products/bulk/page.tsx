import { d1All } from '@/lib/d1';
import BulkProductUploader from './BulkProductUploader';

export const dynamic = 'force-dynamic';

export default async function BulkProductsPage() {
  const categories = await d1All<any>('SELECT id, name, slug, parentId FROM Category ORDER BY sortOrder ASC');
  return <BulkProductUploader categories={categories} />;
}