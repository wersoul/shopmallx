import './globals.css';
import type { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import SiteShell from '@/components/SiteShell';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: s.site_name || 'SHOPMALLX',
    description: s.site_tagline || 'ศูนย์รวมสินค้าออนไลน์ ครบวงจร'
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <body className="min-h-screen flex flex-col">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}