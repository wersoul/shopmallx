import { d1All } from '@/lib/d1';
import ProductCard from '@/components/ProductCard';
import CategorySidebar from '@/components/CategorySidebar';
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

  // Sidebar links and active-state helpers moved into <CategorySidebar/>
  // (client component) so we can drive collapse/expand from the URL.

  return (
    <div className="max-w-7xl mx-auto px-3 py-4">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-3">
        <Link href="/" className="hover:text-brand-600">หน้าแรก</Link> / <span>สินค้า</span>
        {activeCat && <span> / {activeCat.name}</span>}
        {activeSub && <span> / {activeSub.name}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar (collapsible per parent) */}
        <CategorySidebar
          parents={parents}
          childrenByParent={childrenByParent}
          activeCategoryId={activeCat?.id ?? null}
          activeSubId={activeSub?.id ?? null}
          searchCategory={searchParams.category}
          searchSub={searchParams.subcategory}
        />

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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}