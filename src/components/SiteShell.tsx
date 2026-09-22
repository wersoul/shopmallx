import { getSettings } from '@/lib/settings';
import { d1All } from '@/lib/d1';
import { getCurrentUser } from '@/lib/auth';
import { paletteFromHex } from '@/lib/color';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import AuthTimeout from '@/components/AuthTimeout';

export default async function SiteShell({ children }: { children: React.ReactNode }) {
  const settings = await getSettings();
  const allCats = await d1All<any>('SELECT id, name, slug, parentId, sortOrder FROM Category WHERE isActive = 1 ORDER BY sortOrder ASC');
  const parents = allCats.filter((c: any) => !c.parentId);
  const byParent: Record<string, any[]> = {};
  for (const c of allCats) {
    if (c.parentId) {
      if (!byParent[c.parentId]) byParent[c.parentId] = [];
      byParent[c.parentId].push(c);
    }
  }
  const categories = parents.map((p: any) => ({ ...p, children: byParent[p.id] || [] }));
  const user = await getCurrentUser();
  const userPlain = user ? { id: user.id, name: user.name, role: user.role } : null;

  const primaryColor = settings.primary_color || '#ff2d2d';
  const palette = paletteFromHex(primaryColor);
  const themeCss = palette.isValid ? `:root{${palette.cssText}}` : '';

  return (
    <>
      {themeCss && <style dangerouslySetInnerHTML={{ __html: themeCss }} />}
      <Header settings={settings} categories={categories} user={userPlain} />
      <AuthTimeout loggedIn={!!userPlain} />
      <main className="flex-1">{children}</main>
      <Footer settings={settings} />
    </>
  );
}