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