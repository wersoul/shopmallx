import { NextRequest } from 'next/server';
import { getSettings } from '@/lib/settings';
import { ImageResponse } from '@vercel/og';

export const runtime = 'edge';

/**
 * Generate a 1200x630 Open Graph image at the edge using `@vercel/og`'s
 * React-based renderer. Designed for Cloudflare Pages / Vercel Edge runtime
 * with no Node.js dependencies - uses resvg + yoga-wasm internally.
 *
 * The card carries the site name + the focus keyword phrase
 * "อะไหล่เกษตร อะไหล่เครื่องมือ อะไหล่เครื่องจักร" so that the rendered image
 * reinforces SEO when shared on Facebook / LINE / Twitter.
 */
export async function GET(_req: NextRequest) {
  const settings = await getSettings();
  const siteName = settings.site_name || 'SHOPMALLX';
  const tagline =
    settings.site_tagline || 'อะไหล่เกษตร อะไหล่เครื่องมือ อะไหล่เครื่องจักร';
  const logoUrl = settings.logo_url;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background:
            'linear-gradient(135deg, #4F46E5 0%, #7C3AED 50%, #EC4899 100%)',
          color: 'white',
          padding: '64px 80px',
          fontFamily: 'sans-serif'
        }}
      >
        {/* Top row: optional logo */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '24px',
            marginBottom: '32px'
          }}
        >
          {logoUrl ? (
            <img
              src={logoUrl}
              width={120}
              height={120}
              style={{ borderRadius: '24px', objectFit: 'cover' }}
            />
          ) : (
            <div
              style={{
                width: '120px',
                height: '120px',
                borderRadius: '24px',
                background: 'rgba(255,255,255,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '60px',
                fontWeight: 900
              }}
            >
              S
            </div>
          )}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div style={{ fontSize: '36px', fontWeight: 700 }}>{siteName}</div>
            <div style={{ fontSize: '20px', opacity: 0.85 }}>
              ศูนย์รวมอะไหล่ออนไลน์
            </div>
          </div>
        </div>

        {/* Big tagline */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            marginTop: 'auto',
            marginBottom: 'auto'
          }}
        >
          <div style={{ fontSize: '72px', fontWeight: 900, lineHeight: 1.1 }}>
            อะไหล่เกษตร
          </div>
          <div style={{ fontSize: '72px', fontWeight: 900, lineHeight: 1.1 }}>
            อะไหล่เครื่องมือ
          </div>
          <div
            style={{
              fontSize: '40px',
              fontWeight: 600,
              opacity: 0.9,
              marginTop: '12px'
            }}
          >
            อะไหล่เครื่องจักร · อุปกรณ์การเกษตร · เครื่องมือช่าง
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '24px',
            opacity: 0.85,
            marginTop: '32px'
          }}
        >
          <div>{tagline}</div>
          <div>🚚 ส่งเร็วทั่วประเทศ · เก็บเงินปลายทาง</div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        'cache-control':
          'public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400'
      }
    }
  );
}