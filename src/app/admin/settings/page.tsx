import { prisma, ensurePrisma } from '@/lib/prisma';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const prisma = await ensurePrisma();
  const settings = await prisma.setting.findMany();
  const safe = (settings as any[]).map(s => ({ id: s.id, key: s.key, value: s.value }));
  return <SettingsForm settings={safe} />;
}