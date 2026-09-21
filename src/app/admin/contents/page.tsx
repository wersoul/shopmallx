import { d1All, serialize } from '@/lib/d1';
import ContentsManager from './ContentsManager';

export const dynamic = 'force-dynamic';

export default async function AdminContentsPage() {
  const items = await d1All<any>('SELECT id, key, title, body FROM Content');
  return <ContentsManager contents={serialize(items) as any} />;
}