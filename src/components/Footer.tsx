import Link from 'next/link';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';

export default function Footer({ settings }: { settings: Record<string, string> }) {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-12">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <h3 className="text-white font-bold text-lg mb-3">{settings.site_name}</h3>
          <p className="text-sm leading-relaxed">{settings.site_tagline}</p>
          <div className="mt-4 space-y-2 text-sm">
            <div className="flex items-start gap-2"><FiPhone className="mt-1 shrink-0" /> {settings.phone}</div>
            <div className="flex items-start gap-2"><FiMail className="mt-1 shrink-0" /> {settings.email}</div>
            <div className="flex items-start gap-2"><FiMapPin className="mt-1 shrink-0" /> {settings.address}</div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">หมวดหมู่</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/products?category=pump" className="hover:text-brand-400">ปั๊มน้ำ</Link></li>
            <li><Link href="/products?category=motor" className="hover:text-brand-400">มอเตอร์</Link></li>
            <li><Link href="/products?category=tools" className="hover:text-brand-400">เครื่องมือช่าง</Link></li>
            <li><Link href="/products?category=capacitor" className="hover:text-brand-400">คอนเดนเซอร์</Link></li>
            <li><Link href="/products" className="hover:text-brand-400">ดูทั้งหมด</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">ช่วยเหลือ</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/howto" className="hover:text-brand-400">วิธีการสั่งซื้อ</Link></li>
            <li><Link href="/policy" className="hover:text-brand-400">นโยบายการคืนสินค้า</Link></li>
            <li><Link href="/contact" className="hover:text-brand-400">ติดต่อเรา</Link></li>
            <li><Link href="/about" className="hover:text-brand-400">เกี่ยวกับเรา</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-3">ช่องทางการชำระเงิน</h4>
          <div className="text-sm space-y-1">
            <div className="font-semibold text-white">{settings.bank_name}</div>
            <div>เลขที่บัญชี: <span className="text-brand-400 font-mono">{settings.bank_account}</span></div>
            <div>ชื่อบัญชี: {settings.bank_holder}</div>
          </div>
          <div className="mt-4 text-xs">ติดตามเรา</div>
          <div className="flex gap-3 mt-2 text-sm">
            <a href={`https://${settings.facebook}`} className="hover:text-brand-400">Facebook</a>
            <a href={`https://${settings.youtube}`} className="hover:text-brand-400">YouTube</a>
            <span className="hover:text-brand-400">Line: {settings.line_id}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800 py-4 text-center text-xs text-gray-500">
        Copyright © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
      </div>
    </footer>
  );
}