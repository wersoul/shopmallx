import { d1All, serialize } from '@/lib/d1';
import PromotionsManager from './PromotionsManager';

export const dynamic = 'force-dynamic';

export default async function AdminPromotionsPage() {
  const items = await d1All<any>('SELECT id, title, description, image, badge, link, sortOrder, isActive FROM Promotion ORDER BY sortOrder ASC');
  return <PromotionsManager promotions={serialize(items) as any} />;
}