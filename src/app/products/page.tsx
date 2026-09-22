import { d1All, d1First } from '@/lib/d1';
import ProductCard from '@/components/ProductCard';
import CategorySidebar from '@/components/CategorySidebar';
import Pagination from '@/components/Pagination';
import Link from 'next/link';
import type { Metadata } from 'next';
import { getSeo, jsonLd, SEO_DEFAULTS } from '@/lib/settings';

/** Items per page options exposed to visitors. */
const ALLOWED_PER_PAGE = [25, 50] as const;
const DEFAULT_PER_PAGE = 25;

/** Parse ?page / ?perPage into safe integers. Out-of-range values fall back. */
function parsePagination(sp: { page?: string; perPage?: string }) {
  const rawPage = parseInt(sp.page || '1', 10);
  const rawPer = parseInt(sp.perPage || String(DEFAULT_PER_PAGE), 10);
  const perPage =
    (ALLOWED_PER_PAGE as readonly number[]).includes(rawPer)
      ? rawPer
      : DEFAULT_PER_PAGE;
  const page = Number.isFinite(rawPage) && rawPage >= 1 ? rawPage : 1;
  return { page, perPage };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  searchParams
}: {
  searchParams: {
    category?: string;
    subcategory?: string;
    q?: string;
    featured?: string;
    new?: string;
    page?: string;
  };
}): Promise<Metadata> {
  const seo = await getSeo();
  const allCats = await d1All<{ name: string; slug: string }>(
    'SELECT name, slug FROM Category WHERE isActive = 1'
  );

  let title = 'สินค้าทั้งหมด | อะไหล่เกษตร อะไหล่เครื่องมือ';
  let description =
    'รวมสินค้าอะไหล่เกษตร อะไหล่เครื่องมือ อะไหล่เครื่องจักร อุปกรณ์การเกษตร เครื่องมือช่าง ' +
    'หลากหลายแบรนด์ ราคาถูก ของแท้ ส่งเร็ว เก็บเงินปลายทางได้';
  let canonical = '/products';

  if (searchParams.featured === '1') {
    title = 'สินค้าแนะนำ | อะไหล่เกษตร อะไหล่เครื่องมือ';
    description =
      'สินค้าแนะนำ อะไหล่เกษตร อะไหล่เครื่องมือ อะไหล่เครื่องจักร คัดสรรคุณภาพ ราคาถูก ของแท้ ส่งเร็วทั่วประเทศ';
    canonical = '/products?featured=1';
  } else if (searchParams.new === '1') {
    title = 'สินค้าใหม่ | อะไหล่เกษตร อะไหล่เครื่องมือ';
    description =
      'สินค้าใหม่ อะไหล่เกษตร อะไหล่เครื่องมือ อะไหล่เครื่องจักร อัปเดตล่าสุด ราคาถูก ของแท้';
    canonical = '/products?new=1';
  } else if (searchParams.subcategory) {
    const sub = allCats.find(c => c.slug === searchParams.subcategory);
    if (sub) {
      title = `${sub.name} - อะไหล่เกษตร อะไหล่เครื่องมือ | SHOPMALLX`;
      description = `เลือกซื้อ${sub.name} อะไหล่เกษตร อะไหล่เครื่องมือ อะไหล่เครื่องจักร หลายรายการ ราคาถูก ของแท้ ส่งเร็วทั่วประเทศ`;
      canonical = `/products?subcategory=${searchParams.subcategory}`;
    }
  } else if (searchParams.category) {
    const cat = allCats.find(c => c.slug === searchParams.category);
    if (cat) {
      title = `${cat.name} - อะไหล่เกษตร อะไหล่เครื่องมือ | SHOPMALLX`;
      description = `เลือกซื้อ${cat.name} อะไหล่เกษตร อะไหล่เครื่องมือ อะไหล่เครื่องจักร ครบทุกหมวด หลายรายการ ราคาถูก ของแท้`;
      canonical = `/products?category=${searchParams.category}`;
    }
  } else if (searchParams.q) {
    title = `ค้นหา "${searchParams.q}" | อะไหล่เกษตร อะไหล่เครื่องมือ`;
    description = `ผลการค้นหา "${searchParams.q}" อะไหล่เกษตร อะไหล่เครื่องมือ ราคาถูก`;
    canonical = `/products?q=${encodeURIComponent(searchParams.q)}`;
  }

  const ogImage = seo.ogImage.startsWith('http') ? seo.ogImage : `${seo.siteUrl}${seo.ogImage}`;
  const pageUrl = `${seo.siteUrl}${canonical}`;

  return {
    title,
    description,
    keywords: `${title}, ${SEO_DEFAULTS.seo_keywords}`,
    alternates: {
      canonical,
      languages: { 'th-TH': canonical }
    },
    openGraph: {
      type: 'website',
      url: pageUrl,
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage]
    }
  };
}

export default async function ProductsPage({
  searchParams
}: {
  searchParams: {
    category?: string;
    subcategory?: string;
    q?: string;
    featured?: string;
    new?: string;
    page?: string;
    perPage?: string;
  };
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
  // Homepage-driven filters (สินค้าแนะนำ / สินค้าใหม่). When ?featured=1
  // or ?new=1, ignore any other filters so the homepage "ดูทั้งหมด"
  // link behaves the same as the homepage section.
  const filterByFeatured = searchParams.featured === '1';
  const filterByNew = searchParams.new === '1';
  if (filterByFeatured || filterByNew) {
    // Reset category/q binds so the curated section is global.
    clauses.length = 1; // keep only isActive = 1
    binds.length = 0;
    if (filterByFeatured) clauses.push('isFeatured = 1');
    if (filterByNew) clauses.push('isNew = 1');
  }

  const { page, perPage } = parsePagination(searchParams);
  const offset = (page - 1) * perPage;

  // Total count for pagination UI.
  const countRow = await d1First<{ n: number }>(
    `SELECT COUNT(*) AS n FROM Product WHERE ${clauses.join(' AND ')}`,
    binds
  );
  const totalItems = countRow?.n ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / perPage));

  // Page slice.
  const products = await d1All<any>(
    `SELECT id, name, slug, price, salePrice, images, isFeatured, isNew FROM Product WHERE ${clauses.join(' AND ')} ORDER BY createdAt DESC LIMIT ? OFFSET ?`,
    [...binds, perPage, offset]
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
              {filterByFeatured
                ? '⭐ สินค้าแนะนำ'
                : filterByNew
                  ? '🆕 สินค้าใหม่'
                  : activeSub
                    ? `${activeCat?.name ? activeCat.name + ' / ' : ''}${activeSub.name}`
                    : activeCat
                      ? activeCat.name
                      : searchParams.q
                        ? `ผลการค้นหา: ${searchParams.q}`
                        : 'สินค้าทั้งหมด'}
            </h1>
            <span className="text-sm text-gray-500">
              ทั้งหมด {totalItems.toLocaleString('th-TH')} รายการ
              {totalPages > 1 && (
                <>
                  {' · '}
                  หน้า {page} / {totalPages}
                </>
              )}
            </span>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-lg shadow-card p-10 text-center text-gray-500">
              <div className="text-6xl mb-2">📦</div>
              <div>ไม่พบสินค้า</div>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {products.map(p => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                totalItems={totalItems}
                pageSize={perPage}
                basePath="/products"
                extraParams={{
                  category: searchParams.category,
                  subcategory: searchParams.subcategory,
                  q: searchParams.q,
                  featured: filterByFeatured ? '1' : undefined,
                  new: filterByNew ? '1' : undefined
                }}
              />
            </>
          )}
        </div>
      </div>

      <ProductsStructuredData
        searchParams={searchParams}
        categoryName={activeSub?.name || activeCat?.name || ''}
        productCount={totalItems}
      />
    </div>
  );
}

/**
 * JSON-LD for the products listing. Renders CollectionPage + BreadcrumbList
 * based on the active category/subcategory filter so search engines can
 * show rich results (product count, breadcrumb).
 */
async function ProductsStructuredData({
  searchParams,
  categoryName,
  productCount
}: {
  searchParams: { category?: string; subcategory?: string; q?: string };
  categoryName: string;
  productCount: number;
}) {
  const seo = await getSeo();
  const baseUrl = seo.siteUrl;

  let pageName = 'สินค้าทั้งหมด';
  let pageUrl = `${baseUrl}/products`;
  const items: { name: string; item: string }[] = [
    { name: 'หน้าแรก', item: `${baseUrl}/` },
    { name: 'สินค้าทั้งหมด', item: `${baseUrl}/products` }
  ];

  if (categoryName) {
    pageName = categoryName;
    pageUrl = searchParams.subcategory
      ? `${baseUrl}/products?subcategory=${searchParams.subcategory}`
      : `${baseUrl}/products?category=${searchParams.category}`;
    items.push({ name: categoryName, item: pageUrl });
  }

  const collectionLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: `${pageName} - อะไหล่เกษตร อะไหล่เครื่องมือ | SHOPMALLX`,
    description:
      'รวมอะไหล่เกษตร อะไหล่เครื่องมือ อะไหล่เครื่องจักร หลากหลายรายการ ราคาถูก',
    url: pageUrl,
    inLanguage: 'th-TH',
    isPartOf: { '@type': 'WebSite', name: 'SHOPMALLX', url: baseUrl }
  };

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: it.item
    }))
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(collectionLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd) }}
      />
    </>
  );
}