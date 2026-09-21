import { getSettings } from '@/lib/settings';
import { prisma } from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const categories = await prisma.category.findMany({
    where: { parentId: null, isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { children: { where: { isActive: true } } }
  });
  const user = await getCurrentUser();
  const userPlain = user ? { id: user.id, name: user.name, role: user.role } : null;
  return (
    <>
      <Header settings={settings} categories={categories} user={userPlain} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}