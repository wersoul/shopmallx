import { prisma, ensurePrisma } from '@/lib/prisma';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const prisma = await ensurePrisma();
  const settings = await prisma.setting.findMany();
  return <SettingsForm settings={settings} />;
}