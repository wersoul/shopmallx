import Link from 'next/link';
import BannerSlider from '@/components/BannerSlider';
import ProductCard from '@/components/ProductCard';
import { d1All } from '@/lib/d1';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [banners, sidebar, promotions, featured, newProducts, categories] = await Promise.all([
    d1All<any>('SELECT id, title, subtitle, image, link FROM Banner WHERE position = ? AND isActive = 1 ORDER BY sortOrder ASC', ['hero']),
    d1All<any>('SELECT id, title, subtitle, image, link FROM Banner WHERE position = ? AND isActive = 1 ORDER BY sortOrder ASC LIMIT 2', ['sidebar']),
    d1All<any>('SELECT id, title, description, badge FROM Promotion WHERE isActive = 1 ORDER BY sortOrder ASC'),
    d1All<any>('SELECT id, name, slug, price, salePrice, images FROM Product WHERE isFeatured = 1 AND isActive = 1 ORDER BY createdAt DESC LIMIT 8'),
    d1All<any>('SELECT id, name, slug, price, salePrice, images FROM Product WHERE isNew = 1 AND isActive = 1 ORDER BY createdAt DESC LIMIT 8'),
    d1All<any>('SELECT id, name, slug, parentId, sortOrder FROM Category WHERE isActive = 1 ORDER BY sortOrder ASC')
  ]);
  // Build parent + children tree
  const parents = categories.filter((c: any) => !c.parentId);
  const byParent: Record<string, any[]> = {};
  for (const c of categories) {
    if (c.parentId) {
      if (!byParent[c.parentId]) byParent[c.parentId] = [];
      byParent[c.parentId].push(c);
    }
  }
  const enrichedCategories = parents.map((p: any) => ({ ...p, children: byParent[p.id] || [] }));

  return (
    <div className="max-w-7xl mx-auto px-3 py-4 space-y-6">
      {/* Hero + Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div className="lg:col-span-3">
          <BannerSlider banners={banners} />
        </div>
        <div className="lg:col-span-1 grid grid-cols-2 lg:grid-cols-1 gap-3">
          {sidebar.map(b => (
            <Link key={b.id} href={b.link || '#'} className="relative rounded-xl overflow-hidden h-[140px] lg:h-[195px] shadow-md group">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-3 text-white">
                <div className="font-bold text-sm">{b.title}</div>
                <div className="text-xs opacity-90">{b.subtitle}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Promotions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {promotions.map(p => (
          <div key={p.id} className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-lg p-4 flex items-center gap-3 shadow">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-extrabold text-lg shrink-0">{p.badge}</div>
            <div className="min-w-0">
              <div className="font-bold text-sm truncate">{p.title}</div>
              <div className="text-xs opacity-90 truncate">{p.description}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Categories shortcut */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-800">หมวดหมู่สินค้า</h2>
          <Link href="/products" className="text-brand-600 text-sm hover:underline">ดูทั้งหมด →</Link>
        </div>
        <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
          {enrichedCategories.map(c => (
            <Link key={c.id} href={`/products?category=${c.slug}`}
              className="bg-white rounded-lg p-3 text-center shadow-card hover:shadow-lg hover:-translate-y-0.5 transition border border-gray-100">
              <div className="w-12 h-12 mx-auto bg-brand-50 rounded-full flex items-center justify-center text-2xl">📦</div>
              <div className="text-xs mt-2 font-medium line-clamp-2">{c.name}</div>
              {c.children.length > 0 && <div className="text-[10px] text-gray-400 mt-0.5">{c.children.length} หมวดย่อย</div>}
            </Link>
          ))}
        </div>
      </div>

      {/* Featured Products */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xl font-bold text-gray-800">สินค้าแนะนำ</h2>
          <Link href="/products" className="text-brand-600 text-sm hover:underline">ดูทั้งหมด →</Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {featured.map(p => <ProductCard key={p.id} product={p} />)}
        </div>
      </div>

      {/* New Products */}
      {newProducts.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold text-gray-800">สินค้ามาใหม่</h2>
            <Link href="/products" className="text-brand-600 text-sm hover:underline">ดูทั้งหมด →</Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {newProducts.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  );
}