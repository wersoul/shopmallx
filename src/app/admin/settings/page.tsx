import { d1All, serialize } from '@/lib/d1';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const settings = await d1All<any>('SELECT id, key, value FROM Setting');
  return <SettingsForm settings={serialize(settings) as any} />;
}