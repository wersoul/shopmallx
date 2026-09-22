'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { FiSearch, FiUser, FiShoppingCart, FiMenu, FiX, FiLogOut, FiPackage } from 'react-icons/fi';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';

export default function Header({ settings, categories, user }: {
  settings: Record<string, string>;
  categories: { id: string; name: string; slug: string; children?: any[] }[];
  user?: { id: string; name: string; role: string } | null;
}) {
  const router = useRouter();
  const params = useSearchParams();
  const pathname = usePathname();
  const [q, setQ] = useState(params.get('q') || '');
  const [open, setOpen] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Hover-driven state — small delay so the user can reach the dropdown without
  // it collapsing mid-movement. Outside-click closes immediately.
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const [hovering, setHovering] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cancelClose = () => {
    if (closeTimer.current) { clearTimeout(closeTimer.current); closeTimer.current = null; }
  };
  const scheduleClose = () => {
    cancelClose();
    closeTimer.current = setTimeout(() => { setHovering(false); setUserMenu(false); }, 180);
  };
  const openMenu = () => { cancelClose(); setHovering(true); setUserMenu(true); };

  // Close on outside click / Escape
  useEffect(() => {
    if (!userMenu) return;
    const onDoc = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenu(false);
        setHovering(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setUserMenu(false); setHovering(false); }
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [userMenu]);

  // Close whenever the route changes so stale menus don't linger
  useEffect(() => { setUserMenu(false); setHovering(false); }, [pathname]);

  useEffect(() => { setQ(params.get('q') || ''); }, [params]);
  useEffect(() => {
    const update = () => {
      const items = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartCount(items.reduce((s: number, i: any) => s + i.quantity, 0));
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cartUpdate', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('cartUpdate', update);
    };
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(q.trim() ? `/products?q=${encodeURIComponent(q)}` : '/products');
  };

  const logout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
    router.refresh();
  };

  const isAdmin = user?.role === 'admin';

  return (
    <header className="sticky top-0 z-40 bg-white shadow-sm border-b border-gray-200">
      <div className="bg-brand-600 text-white text-xs">
        <div className="max-w-7xl mx-auto px-3 py-1.5 flex items-center justify-between">
          <div className="hidden md:flex gap-4">
            <span>📞 {settings.phone}</span>
            <span>✉ {settings.email}</span>
          </div>
          <div className="flex gap-3 ml-auto">
            {user ? (
              <span className="opacity-90">สวัสดี {user.name}</span>
            ) : (
              <>
                <Link href="/login" className="hover:underline">เข้าสู่ระบบ</Link>
                <Link href="/register" className="hover:underline">สมัครสมาชิก</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 py-3 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          {settings.logo_url ? (
            <img
              src={settings.logo_url}
              alt={settings.site_name || 'logo'}
              className="h-10 w-auto max-w-[160px] object-contain"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center text-white font-extrabold text-lg shadow-md">
              {(settings.logo_text || 'S').charAt(0)}
            </div>
          )}
          <div className="hidden sm:block leading-tight">
            <div className="font-extrabold text-xl text-brand-600">{settings.logo_text || 'SHOPMALLX'}</div>
            <div className="text-[10px] text-gray-500 -mt-1">{settings.site_tagline}</div>
          </div>
        </Link>

        <form onSubmit={onSearch} className="flex-1 max-w-2xl mx-auto">
          <div className="flex border-2 border-brand-500 rounded-full overflow-hidden">
            <input type="text" value={q} onChange={e => setQ(e.target.value)}
              placeholder="ค้นหาสินค้า..." className="flex-1 px-4 py-2 outline-none text-sm" />
            <button className="bg-brand-600 text-white px-5 hover:bg-brand-700" type="submit"><FiSearch /></button>
          </div>
        </form>

        <div className="flex items-center gap-2">
          <Link href="/cart" className="relative p-2 rounded-full hover:bg-gray-100" aria-label="ตะกร้า">
            <FiShoppingCart className="text-xl" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-brand-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{cartCount}</span>
            )}
          </Link>

          {user ? (
            <div
              className="relative"
              ref={userMenuRef}
              onMouseEnter={openMenu}
              onMouseLeave={scheduleClose}
            >
              <button
                onClick={() => (userMenu ? setUserMenu(false) : openMenu())}
                onFocus={openMenu}
                aria-haspopup="menu"
                aria-expanded={userMenu}
                className={`p-2 rounded-full hover:bg-gray-100 ${userMenu || hovering ? 'bg-gray-100' : ''}`}
                aria-label="บัญชี"
              >
                <FiUser className="text-xl" />
              </button>
              {(userMenu || hovering) && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white border rounded-lg shadow-lg overflow-hidden"
                  role="menu"
                  onMouseEnter={openMenu}
                  onMouseLeave={scheduleClose}
                >
                  <div className="px-4 py-3 border-b bg-gray-50">
                    <div className="font-semibold text-sm">{user.name}</div>
                    <div className="text-xs text-gray-500">{isAdmin ? 'ผู้ดูแลระบบ' : 'ลูกค้า'}</div>
                  </div>
                  <Link href="/account" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"><FiUser /> บัญชีของฉัน</Link>
                  <Link href="/account/orders" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm"><FiPackage /> รายการสั่งซื้อ</Link>
                  {isAdmin && <Link href="/admin" className="flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm border-t text-brand-600 font-semibold">⚙ หลังบ้าน</Link>}
                  <button onClick={logout} className="w-full flex items-center gap-2 px-4 py-2 hover:bg-gray-50 text-sm border-t text-red-600"><FiLogOut /> ออกจากระบบ</button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login" className="p-2 rounded-full hover:bg-gray-100" aria-label="เข้าสู่ระบบ"><FiUser className="text-xl" /></Link>
          )}

          <button onClick={() => setOpen(!open)} className="md:hidden p-2 rounded-full hover:bg-gray-100" aria-label="เมนู">
            {open ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
          </button>
        </div>
      </div>

      <nav className="bg-white border-t border-gray-100 hidden md:block">
        <div className="max-w-7xl mx-auto px-3">
          <ul className="flex items-center gap-1 text-sm overflow-x-auto no-scrollbar">
            <li><Link href="/" className={`block px-3 py-3 font-semibold hover:text-brand-600 ${pathname === '/' ? 'text-brand-600 border-b-2 border-brand-600' : ''}`}>หน้าแรก</Link></li>
            <li className="relative group">
              <Link href="/products" className={`block px-3 py-3 font-semibold hover:text-brand-600 ${pathname.startsWith('/products') ? 'text-brand-600 border-b-2 border-brand-600' : ''}`}>สินค้าทั้งหมด ▾</Link>
              <div className="absolute left-0 top-full hidden group-hover:block bg-white border rounded-lg shadow-xl min-w-[200px] z-50">
                {categories.map(c => (
                  <Link key={c.id} href={`/products?category=${c.slug}`} className="block px-4 py-2 hover:bg-brand-50 hover:text-brand-600 text-sm">{c.name}</Link>
                ))}
              </div>
            </li>
            <li><Link href="/howto" className="block px-3 py-3 font-semibold hover:text-brand-600">วิธีการสั่งซื้อ</Link></li>
            <li><Link href="/policy" className="block px-3 py-3 font-semibold hover:text-brand-600">นโยบาย</Link></li>
            <li><Link href="/about" className="block px-3 py-3 font-semibold hover:text-brand-600">เกี่ยวกับเรา</Link></li>
            <li><Link href="/contact" className="block px-3 py-3 font-semibold hover:text-brand-600">ติดต่อเรา</Link></li>
          </ul>
        </div>
      </nav>

      {open && (
        <div className="md:hidden border-t bg-white slide-down overflow-hidden">
          <ul className="max-w-7xl mx-auto px-3 py-2">
            <li><Link href="/" onClick={() => setOpen(false)} className="block py-2 border-b">หน้าแรก</Link></li>
            <li><Link href="/products" onClick={() => setOpen(false)} className="block py-2 border-b">สินค้าทั้งหมด</Link></li>
            {categories.map(c => (
              <li key={c.id}><Link href={`/products?category=${c.slug}`} onClick={() => setOpen(false)} className="block py-2 border-b pl-4 text-gray-600">└ {c.name}</Link></li>
            ))}
            <li><Link href="/howto" onClick={() => setOpen(false)} className="block py-2 border-b">วิธีการสั่งซื้อ</Link></li>
            <li><Link href="/policy" onClick={() => setOpen(false)} className="block py-2 border-b">นโยบาย</Link></li>
            <li><Link href="/about" onClick={() => setOpen(false)} className="block py-2 border-b">เกี่ยวกับเรา</Link></li>
            <li><Link href="/contact" onClick={() => setOpen(false)} className="block py-2">ติดต่อเรา</Link></li>
          </ul>
        </div>
      )}
    </header>
  );
}