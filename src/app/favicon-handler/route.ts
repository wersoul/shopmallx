import { NextRequest, NextResponse } from 'next/server';
import { d1First } from '@/lib/d1';

export const runtime = 'edge';

/**
 * Fallback handler for the static /favicon.ico request browsers always send.
 * Redirects to the auto-generated favicon in R2 if present, otherwise 404.
 *
 * We expose this as a stable URL so the <link rel="icon"> in layout.tsx
 * doesn't need to know the dynamic R2 key (which changes every logo upload).
 */
export async function GET(req: NextRequest) {
  const row = await d1First<{ value: string }>('SELECT value FROM Setting WHERE key = ?', ['favicon_url']);
  if (!row?.value) {
    return new NextResponse('Not Found', { status: 404 });
  }
  // 302 redirect so the browser caches the resolved R2 URL.
  return NextResponse.redirect(row.value, 302);
}