import './globals.css';
import type { Metadata } from 'next';
import { getSettings, getSeo, jsonLd } from '@/lib/settings';
import SiteShell from '@/components/SiteShell';

// Force Edge runtime for Cloudflare Pages compatibility
export const runtime = 'edge';

export async function generateMetadata(): Promise<Metadata> {
  const [settings, seo] = await Promise.all([getSettings(), getSeo()]);
  const icons: Metadata['icons'] = {};
  if (settings.favicon_32_url) icons.icon = settings.favicon_32_url;
  if (settings.favicon_url) icons.shortcut = settings.favicon_url;
  if (settings.apple_touch_url) icons.apple = settings.apple_touch_url;

  const ogImage = seo.ogImage.startsWith('http') ? seo.ogImage : `${seo.siteUrl}${seo.ogImage}`;

  return {
    metadataBase: new URL(seo.siteUrl),
    title: {
      default: seo.title,
      // Only append site name when the child page hasn't already done so.
      // Pages that set a complete title (e.g. product detail) won't get
      // the suffix applied twice.
      template: `%s`
    },
    description: seo.description,
    keywords: seo.keywords,
    authors: [{ name: settings.site_name || 'SHOPMALLX' }],
    creator: settings.site_name || 'SHOPMALLX',
    publisher: settings.site_name || 'SHOPMALLX',
    applicationName: settings.site_name || 'SHOPMALLX',
    formatDetection: { telephone: false, address: false, email: false },
    // Th - Thailand locale + th_TH
    alternates: {
      canonical: '/',
      languages: { 'th-TH': '/' }
    },
    openGraph: {
      type: 'website',
      locale: 'th_TH',
      url: seo.siteUrl,
      siteName: settings.site_name || 'SHOPMALLX',
      title: seo.title,
      description: seo.description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: settings.site_name || 'SHOPMALLX' }]
    },
    twitter: {
      card: 'summary_large_image',
      title: seo.title,
      description: seo.description,
      images: [ogImage]
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1
      }
    },
    icons
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [settings, seo] = await Promise.all([getSettings(), getSeo()]);
  const siteName = settings.site_name || 'SHOPMALLX';

  // Organization + WebSite JSON-LD. Per-page JSON-LD is added in page.tsx
  // (Product / CollectionPage / BreadcrumbList) to enrich search results.
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: siteName,
    url: seo.siteUrl,
    logo: settings.logo_url || `${seo.siteUrl}/favicon-handler`,
    description: seo.description,
    sameAs: [] as string[]
  };
  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: siteName,
    url: seo.siteUrl,
    inLanguage: 'th-TH',
    description: seo.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${seo.siteUrl}/products?q={search_term}`,
      'query-input': 'required name=search_term'
    }
  };

  return (
    <html lang="th">
      <head>
        <link rel="icon" type="image/x-icon" href="/favicon-handler" />
        {/* Canonical + locale alternates are injected by Next.js metadata */}
        <meta name="geo.region" content="TH" />
        <meta name="geo.placename" content="Thailand" />
        <meta name="theme-color" content="#4F46E5" />
      </head>
      <body className="min-h-screen flex flex-col">
        <SiteShell>{children}</SiteShell>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(orgLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLd(websiteLd) }}
        />
      </body>
    </html>
  );
}