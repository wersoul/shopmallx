#!/usr/bin/env node
/**
 * Copies `_redirects` from the project root to .vercel/output/static so
 * Cloudflare Pages serves the URL rewrites for our SEO endpoints:
 *   /robots.txt  → /robots-txt
 *   /sitemap.xml → /sitemap-xml
 *   /og-image.png→ /og-image-png
 *
 * Reason: Next.js App Router doesn't allow dots in segment names (it
 * interprets `app/robots.txt/route.ts` as a static asset folder), so we
 * use non-dotted folders internally and expose the canonical SEO URLs
 * through Pages-level rewrites.
 */
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const src = '_redirects';
const dst = '.vercel/output/static/_redirects';

if (!existsSync(src)) {
  console.error(`[copy-redirects] ${src} not found - skipping`);
  process.exit(0);
}
mkdirSync(dirname(dst), { recursive: true });
copyFileSync(src, dst);
console.log(`[copy-redirects] ${src} -> ${dst}`);