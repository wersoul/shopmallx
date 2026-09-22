import { d1All } from './d1';

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await d1All<any>('SELECT key, value FROM Setting');
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
}

/**
 * Default SEO copy. Used when Setting rows `seo_title`, `seo_description`,
 * `seo_keywords`, `site_url` are not yet configured by admin.
 *
 * Keyword focus (TH): อะไหล่เกษตร, อะไหล่เครื่องมือ, อะไหล่เครื่องจักร,
 * ชิ้นส่วนเครื่องจักรเกษตร, อุปกรณ์การเกษตร, เครื่องมือช่าง, อะไหล่ทดแทน,
 * ซ่อมบำรุง, ส่งเร็ว, เก็บเงินปลายทาง, จัดส่งทั่วประเทศ.
 */
export const SEO_DEFAULTS = {
  seo_title: 'อะไหล่เกษตร อะไหล่เครื่องมือ อะไหล่เครื่องจักร | SHOPMALLX',
  seo_description:
    'ศูนย์รวมอะไหล่เกษตร อะไหล่เครื่องมือ อะไหล่เครื่องจักร ชิ้นส่วนทดแทนคุณภาพดี ' +
    'อุปกรณ์การเกษตร เครื่องมือช่าง และอะไหล่อุตสาหกรรม หลากหลายแบรนด์ ' +
    'ราคาถูก ของแท้ ส่งเร็วทั่วประเทศ เก็บเงินปลายทางได้',
  seo_keywords:
    'อะไหล่เกษตร, อะไหล่เครื่องมือ, อะไหล่เครื่องจักร, อะไหล่อุตสาหกรรม, ' +
    'ชิ้นส่วนเครื่องจักรเกษตร, อุปกรณ์การเกษตร, เครื่องมือช่าง, เครื่องมือเกษตร, ' +
    'อะไหล่รถไถ, อะไหล่ปั๊มน้ำ, อะไหล่เครื่องตัดหญ้า, อะไหล่ทดแทน, ' +
    'ซ่อมบำรุง, ซื้ออะไหล่ออนไลน์, ร้านอะไหล่, ศูนย์รวมอะไหล่, ' +
    'จัดส่งทั่วประเทศ, เก็บเงินปลายทาง, ส่งเร็ว, ของแท้, ราคาถูก',
  site_url: 'https://shopmallx.pages.dev',
  og_image: '/og-image.png'
} as const;

export interface SeoConfig {
  title: string;
  description: string;
  keywords: string;
  siteUrl: string;
  ogImage: string;
}

/**
 * Resolve SEO config from D1 settings + defaults.
 * Call once per request - very cheap.
 */
export async function getSeo(): Promise<SeoConfig> {
  const s = await getSettings();
  return {
    title: s.seo_title || SEO_DEFAULTS.seo_title,
    description: s.seo_description || SEO_DEFAULTS.seo_description,
    keywords: s.seo_keywords || SEO_DEFAULTS.seo_keywords,
    siteUrl: (s.site_url || SEO_DEFAULTS.site_url).replace(/\/+$/, ''),
    ogImage: s.og_image || SEO_DEFAULTS.og_image
  };
}

/**
 * JSON-LD helper - stringify with safe escaping for embedding in <script>.
 */
export function jsonLd(obj: unknown): string {
  return JSON.stringify(obj).replace(/</g, '\\u003c');
}

export function priceFormat(n: number) {
  return new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(n);
}

/**
 * Render an ISO-8601 timestamp (or Date) as `DD/MM/YYYY HH:MM` in Thai time.
 *
 * D1 / SQLite stores datetimes as ISO strings without a timezone marker (e.g.
 * "2026-09-22T15:32:41.034Z"). We display everything in UTC+7 to match the
 * expected local time for Thai customers — the user's browser will otherwise
 * show UTC, which is 7 hours off and confusing.
 *
 * Pass a fallback string ("-" etc.) when the date is missing so the caller
 * doesn't need to handle null.
 */
export function formatDateTime(input: string | Date | null | undefined, fallback = '-'): string {
  if (!input) return fallback;
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return fallback;
  // Convert to Thai time (UTC+7) regardless of the input timezone
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60_000;
  const thai = new Date(utcMs + 7 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const dd = pad(thai.getDate());
  const mm = pad(thai.getMonth() + 1);
  const yyyy = thai.getFullYear();
  const hh = pad(thai.getHours());
  const mi = pad(thai.getMinutes());
  return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
}

/**
 * Returns just the `HH:MM` portion of an ISO timestamp in Thai time.
 * Useful when the date is shown elsewhere and we only want the time.
 */
export function formatTime(input: string | Date | null | undefined, fallback = '-'): string {
  if (!input) return fallback;
  const d = typeof input === 'string' ? new Date(input) : input;
  if (isNaN(d.getTime())) return fallback;
  const utcMs = d.getTime() + d.getTimezoneOffset() * 60_000;
  const thai = new Date(utcMs + 7 * 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(thai.getHours())}:${pad(thai.getMinutes())}`;
}

export function statusLabel(s: string) {
  const map: Record<string, string> = {
    pending: 'รอชำระเงิน',
    paid: 'แจ้งชำระแล้ว',
    verified: 'ตรวจสอบแล้ว',
    shipping: 'กำลังจัดส่ง',
    completed: 'สำเร็จ',
    cancelled: 'ยกเลิก'
  };
  return map[s] || s;
}

export function statusColor(s: string) {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    paid: 'bg-blue-100 text-blue-800',
    verified: 'bg-indigo-100 text-indigo-800',
    shipping: 'bg-purple-100 text-purple-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };
  return map[s] || 'bg-gray-100 text-gray-800';
}