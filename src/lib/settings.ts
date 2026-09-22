import { d1All } from './d1';

export async function getSettings(): Promise<Record<string, string>> {
  const rows = await d1All<any>('SELECT key, value FROM Setting');
  const map: Record<string, string> = {};
  for (const r of rows) map[r.key] = r.value;
  return map;
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