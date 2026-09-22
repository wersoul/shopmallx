import { NextRequest } from 'next/server';
import { d1All } from '@/lib/d1';
import { getSeo } from '@/lib/settings';

export const runtime = 'edge';

/**
 * Dynamic sitemap.xml. Includes:
 *   - Homepage
 *   - Static policy/info pages
 *   - Each product detail page (/products/<slug>)
 *   - Each category page (/products?category=<slug>)
 *
 * Cache-Control: 1 hour at edge so product updates propagate quickly.
 */
export async function GET(_req: NextRequest) {
  const seo = await getSeo();
  const base = seo.siteUrl;

  const [products, categories] = await Promise.all([
    d1All<{ slug: string; updatedAt: string }>(
      'SELECT slug, updatedAt FROM Product WHERE isActive = 1 ORDER BY updatedAt DESC'
    ),
    d1All<{ slug: string }>('SELECT slug FROM Category WHERE isActive = 1')
  ]);

  const staticPages = [
    { loc: `${base}/`, priority: '1.0', changefreq: 'daily' },
    { loc: `${base}/products`, priority: '0.9', changefreq: 'daily' },
    { loc: `${base}/about`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${base}/contact`, priority: '0.5', changefreq: 'monthly' },
    { loc: `${base}/howto`, priority: '0.6', changefreq: 'monthly' },
    { loc: `${base}/policy`, priority: '0.4', changefreq: 'yearly' }
  ];

  const productUrls = products.map(p => ({
    loc: `${base}/products/${p.slug}`,
    lastmod: p.updatedAt ? new Date(p.updatedAt).toISOString() : '',
    priority: '0.8',
    changefreq: 'weekly'
  }));

  const categoryUrls = categories.map(c => ({
    loc: `${base}/products?category=${c.slug}`,
    lastmod: '',
    priority: '0.7',
    changefreq: 'weekly'
  }));

  const all = [...staticPages, ...productUrls, ...categoryUrls];

  const xml =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    all
      .map((u: { loc: string; lastmod: string; priority: string; changefreq: string }) => {
        const parts = [`  <url>`, `    <loc>${u.loc}</loc>`];
        if (u.lastmod) parts.push(`    <lastmod>${u.lastmod}</lastmod>`);
        if (u.changefreq) parts.push(`    <changefreq>${u.changefreq}</changefreq>`);
        if (u.priority) parts.push(`    <priority>${u.priority}</priority>`);
        parts.push(`  </url>`);
        return parts.join('\n');
      })
      .join('\n') +
    `\n</urlset>\n`;

  return new Response(xml, {
    headers: {
      'content-type': 'application/xml; charset=utf-8',
      'cache-control': 'public, max-age=3600'
    }
  });
}