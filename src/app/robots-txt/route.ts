import { NextRequest } from 'next/server';
import { getSeo } from '@/lib/settings';

export const runtime = 'edge';

/**
 * robots.txt - allow indexing of public pages, disallow admin/account/cart.
 * Sitemap location is read from the same `site_url` setting so we don't
 * hardcode it.
 */
export async function GET(_req: NextRequest) {
  const seo = await getSeo();
  const body = `# robots.txt for ${seo.siteUrl}
User-agent: *
Allow: /
Allow: /products
Allow: /products/

# Private areas
Disallow: /admin
Disallow: /admin/
Disallow: /account
Disallow: /account/
Disallow: /api/
Disallow: /cart
Disallow: /checkout
Disallow: /checkout/
Disallow: /login
Disallow: /register

# Sitemap
Sitemap: ${seo.siteUrl}/sitemap.xml
`;
  return new Response(body, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=3600'
    }
  });
}