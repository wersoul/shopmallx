import { prisma, ensurePrisma } from '@/lib/prisma';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  try {
    const prisma = await ensurePrisma();
    const settings = await prisma.setting.findMany();
    return <SettingsForm settings={settings as any} />;
  } catch (err: any) {
    return <div className="p-6 text-red-600">Settings error: {String(err?.message || err)}</div>;
  }
}