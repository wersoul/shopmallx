import { d1All } from '@/lib/d1';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams
}: {
  searchParams: { category?: string; subcategory?: string; q?: string };
}) {
  const allCats = await d1All<any>(
    'SELECT id, name, slug, parentId, sortOrder FROM Category WHERE isActive = 1 ORDER BY sortOrder ASC, name ASC'
  );
  // Build parent + child lookup so the sidebar can show sub-categories nested
  // underneath their parent (e.g. "เครื่องใช้ไฟฟ้า > ตู้เย็น").
  const parents = allCats.filter((c: any) => !c.parentId);
  const childrenByParent: Record<string, any[]> = {};
  for (const c of allCats) {
    if (c.parentId) {
      if (!childrenByParent[c.parentId]) childrenByParent[c.parentId] = [];
      childrenByParent[c.parentId].push(c);
    }
  }

  // Resolve the active filter. Sub-category wins when both are provided
  // because it's a stricter filter — but we still need the parent for the
  // breadcrumb and to know which sidebar item to highlight.
  let activeCat: any = null;
  let activeSub: any = null;
  let categoryId: string | undefined;
  let subCategoryId: string | undefined;

  if (searchParams.subcategory) {
    const sub = allCats.find(c => c.slug === searchParams.subcategory && c.parentId);
    if (sub) {
      activeSub = sub;
      subCategoryId = sub.id;
      activeCat = allCats.find(c => c.id === sub.parentId) || null;
    }
  }
  if (!activeSub && searchParams.category) {
    const cat = allCats.find(c => c.slug === searchParams.category);
    if (cat) {
      if (!cat.parentId) {
        activeCat = cat;
        categoryId = cat.id;
      } else {
        activeSub = cat;
        subCategoryId = cat.id;
        activeCat = allCats.find(c => c.id === cat.parentId) || null;
      }
    }
  }

  // Build product query. Sub-category filter goes via subCategoryId; pure
  // category filter goes via categoryId.
  const binds: any[] = [];
  const clauses = ['isActive = 1'];
  if (subCategoryId) {
    clauses.push('subCategoryId = ?');
    binds.push(subCategoryId);
  } else if (categoryId) {
    clauses.push('categoryId = ?');
    binds.push(categoryId);
  }
  if (searchParams.q) {
    clauses.push('name LIKE ?');
    binds.push('%' + searchParams.q + '%');
  }
  const products = await d1All<any>(
    `SELECT id, name, slug, price, salePrice, images, isFeatured, isNew FROM Product WHERE ${clauses.join(' AND ')} ORDER BY createdAt DESC`,
    binds
  );

  // Sidebar links: clicking the parent shows all products under it AND any
  // sub-categories; clicking a sub shows only that sub's products.
  const linkFor = (parentSlug: string, subSlug?: string) => {
    const sp = new URLSearchParams();
    sp.set('category', parentSlug);
    if (subSlug) sp.set('subcategory', subSlug);
    return `/products?${sp.toString()}`;
  };

  const isActiveParent = (p: any) =>
    activeCat?.id === p.id && !activeSub;
  const isActiveSub = (s: any) =>
    activeSub?.id === s.id ||
    // also highlight when the sub is being shown via ?category (legacy)
    (!activeSub && activeCat?.id === s.id);

  return (
    <div className="max-w-7xl mx-auto px-3 py-4">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-3">
        <Link href="/" className="hover:text-brand-600">หน้าแรก</Link> / <span>สินค้า</span>
        {activeCat && <span> / {activeCat.name}</span>}
        {activeSub && <span> / {activeSub.name}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-card p-4 sticky top-32">
            <h3 className="font-bold mb-3 text-gray-800">หมวดหมู่</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link
                  href="/products"
                  className={`block py-1.5 px-2 rounded ${!searchParams.category && !searchParams.subcategory ? 'bg-brand-50 text-brand-600 font-semibold' : 'hover:bg-gray-50'}`}
                >
                  ทั้งหมด
                </Link>
              </li>
              {parents.map(p => {
                const subs = childrenByParent[p.id] || [];
                // Auto-expand the sub-list whenever the current filter points
                // at this parent, so the user can drill down without an
                // extra click.
                const showSubs = subs.length > 0 && (isActiveParent(p) || activeCat?.id === p.id);
                return (
                  <li key={p.id}>
                    <Link
                      href={linkFor(p.slug)}
                      className={`block py-1.5 px-2 rounded ${isActiveParent(p) ? 'bg-brand-50 text-brand-600 font-semibold' : 'hover:bg-gray-50'}`}
                    >
                      {p.name}
                    </Link>
                    {showSubs && (
                      <ul className="ml-3 mt-1 border-l border-gray-200 pl-2 space-y-1">
                        <li>
                          <Link
                            href={linkFor(p.slug)}
                            className={`block py-1 px-2 rounded text-xs ${isActiveParent(p) && !activeSub ? 'text-brand-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                          >
                            ทั้งหมดใน{p.name}
                          </Link>
                        </li>
                        {subs.map(s => (
                          <li key={s.id}>
                            <Link
                              href={linkFor(p.slug, s.slug)}
                              className={`block py-1 px-2 rounded text-xs ${isActiveSub(s) ? 'bg-brand-50 text-brand-600 font-semibold' : 'text-gray-600 hover:bg-gray-50'}`}
                            >
                              {s.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>

        {/* Products */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-card p-3 mb-3 flex items-center justify-between">
            <h1 className="font-bold text-gray-800">
              {activeSub
                ? `${activeCat?.name ? activeCat.name + ' / ' : ''}${activeSub.name}`
                : activeCat
                  ? activeCat.name
                  : searchParams.q
                    ? `ผลการค้นหา: ${searchParams.q}`
                    : 'สินค้าทั้งหมด'}
            </h1>
            <span className="text-sm text-gray-500">{products.length} รายการ</span>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-card p-10 text-center text-gray-500">
              <div className="text-6xl mb-2">📦</div>
              <div>ไม่พบสินค้า</div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}