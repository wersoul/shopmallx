import './globals.css';
import type { Metadata } from 'next';
import { getSettings } from '@/lib/settings';
import SiteShell from '@/components/SiteShell';

// Force Edge runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  const icons: Metadata['icons'] = {};
  if (s.favicon_32_url) icons.icon = s.favicon_32_url;
  if (s.favicon_url) icons.shortcut = s.favicon_url;
  if (s.apple_touch_url) icons.apple = s.apple_touch_url;
  return {
    title: s.site_name || 'SHOPMALLX',
    description: s.site_tagline || 'ศูนย์รวมสินค้าออนไลน์ ครบวงจร',
    icons
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th">
      <head>
        {/* Stable URL that redirects to the auto-generated R2 favicon.
            Next's metadata.icons works too, but using a fixed path means
            browsers pick up new uploads without a hard refresh. */}
        <link rel="icon" type="image/x-icon" href="/favicon-handler" />
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}