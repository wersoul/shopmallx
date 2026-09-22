/**
 * Streaming proxy for R2 objects.
 *
 * Hits this route when R2_PUBLIC_BASE is not configured (or for private buckets).
 * Public URL pattern returned by /api/uploads when no R2_PUBLIC_BASE:
 *   /api/r2/<key>
 *
 * The route reads the R2 object via the binding and streams the bytes back
 * with the original content-type. This means uploaded images still display
 * even before you wire up the public R2 hostname or custom CDN domain.
 */
import { NextRequest, NextResponse } from 'next/server';
import { getR2 } from '@/lib/d1';

export const runtime = 'edge';

function cacheControlFor(type: string): string {
  // Images can be cached for a long time at the edge.
  if (type && type.startsWith('image/')) return 'public, max-age=31536000, immutable';
  return 'public, max-age=3600';
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { key: string[] } }
) {
  const r2 = getR2();
  if (!r2) return new NextResponse('R2 binding unavailable', { status: 503 });
  const key = (params.key || []).join('/');
  if (!key) return new NextResponse('Not found', { status: 404 });
  try {
    const obj: any = await r2.get(key);
    if (!obj) return new NextResponse('Not found', { status: 404 });
    const headers = new Headers();
    if (obj.httpMetadata?.contentType) headers.set('content-type', obj.httpMetadata.contentType);
    headers.set('cache-control', cacheControlFor(obj.httpMetadata?.contentType || ''));
    if (obj.etag) headers.set('etag', String(obj.etag));
    if (obj.uploaded) headers.set('last-modified', new Date(obj.uploaded).toUTCString());
    return new NextResponse(obj.body as any, { status: 200, headers });
  } catch (e: any) {
    return new NextResponse('Proxy error: ' + (e?.message || e), { status: 500 });
  }
}