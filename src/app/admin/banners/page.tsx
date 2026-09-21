import { d1All, serialize } from '@/lib/d1';
import BannersManager from './BannersManager';

export const dynamic = 'force-dynamic';

export default async function AdminBannersPage() {
  const banners = await d1All<any>('SELECT id, title, subtitle, image, link, position, sortOrder, isActive FROM Banner ORDER BY sortOrder ASC');
  return <BannersManager banners={serialize(banners) as any} />;
}