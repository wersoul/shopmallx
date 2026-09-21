import { prisma, ensurePrisma } from '@/lib/prisma';
import ProductCard from '@/components/ProductCard';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ProductsPage({ searchParams }: { searchParams: { category?: string; q?: string } }) {
  const prisma = await ensurePrisma();
  const cats = await prisma.category.findMany({ where: { parentId: null, isActive: true }, orderBy: { sortOrder: 'asc' } });
  const allSubs = await prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } });

  let categoryId: string | undefined;
  let activeCat: any = null;
  if (searchParams.category) {
    const cat = allSubs.find(c => c.slug === searchParams.category);
    if (cat) { categoryId = cat.id; activeCat = cat; }
  }

  const where: any = { isActive: true };
  if (categoryId) where.categoryId = categoryId;
  if (searchParams.q) where.name = { contains: searchParams.q };

  const products = await prisma.product.findMany({ where, orderBy: { createdAt: 'desc' } });

  return (
    <div className="max-w-7xl mx-auto px-3 py-4">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-500 mb-3">
        <Link href="/" className="hover:text-brand-600">หน้าแรก</Link> / <span>สินค้า</span>
        {activeCat && <span> / {activeCat.name}</span>}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-card p-4 sticky top-32">
            <h3 className="font-bold mb-3 text-gray-800">หมวดหมู่</h3>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/products" className={`block py-1.5 px-2 rounded ${!searchParams.category ? 'bg-brand-50 text-brand-600 font-semibold' : 'hover:bg-gray-50'}`}>
                  ทั้งหมด
                </Link>
              </li>
              {cats.map(c => (
                <li key={c.id}>
                  <Link href={`/products?category=${c.slug}`}
                    className={`block py-1.5 px-2 rounded ${activeCat?.id === c.id || activeCat?.parentId === c.id ? 'bg-brand-50 text-brand-600 font-semibold' : 'hover:bg-gray-50'}`}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Products */}
        <div className="lg:col-span-3">
          <div className="bg-white rounded-lg shadow-card p-3 mb-3 flex items-center justify-between">
            <h1 className="font-bold text-gray-800">
              {activeCat ? activeCat.name : searchParams.q ? `ผลการค้นหา: ${searchParams.q}` : 'สินค้าทั้งหมด'}
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