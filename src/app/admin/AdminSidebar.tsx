'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const items = [
  { href: '/admin', label: '📊 Dashboard', exact: true },
  { href: '/admin/products', label: '📦 สินค้า' },
  { href: '/admin/categories', label: '📁 หมวดหมู่' },
  { href: '/admin/orders', label: '🛒 คำสั่งซื้อ' },
  { href: '/admin/customers', label: '👥 ลูกค้า' },
  { href: '/admin/banners', label: '🖼 Banner' },
  { href: '/admin/promotions', label: '🎁 โปรโมชั่น' },
  { href: '/admin/contents', label: '📄 เนื้อหา' },
  { href: '/admin/settings', label: '⚙ ตั้งค่าเว็บไซต์' }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="md:col-span-1 bg-white rounded-lg shadow-card p-3 h-fit md:sticky md:top-24">
      <h3 className="font-bold text-brand-600 mb-3 px-2">⚙ หลังบ้าน</h3>
      <ul className="space-y-1">
        {items.map(i => {
          const active = i.exact ? pathname === i.href : pathname.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link href={i.href}
                className={`block py-2 px-3 rounded text-sm transition ${active ? 'bg-brand-600 text-white font-semibold' : 'hover:bg-gray-100'}`}>
                {i.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}