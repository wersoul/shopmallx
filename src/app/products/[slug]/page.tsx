import { d1First, d1All } from '@/lib/d1';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import AddToCart from './AddToCart';
import { priceFormat } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export default async function ProductDetailPage({ params }: { params: { slug: string } }) {
  const productRow = await d1First<any>(
    `SELECT p.id, p.name, p.slug, p.description, p.price, p.salePrice, p.images, p.stock, p.brand, p.categoryId,
            c.name as categoryName, c.slug as categorySlug
     FROM Product p LEFT JOIN Category c ON p.categoryId = c.id
     WHERE p.slug = ? AND p.isActive = 1`,
    [params.slug]
  );
  if (!productRow) return notFound();
  const product = { ...productRow, category: { name: productRow.categoryName, slug: productRow.categorySlug } };

  const images = JSON.parse(product.images || '[]');
  const related = await d1All<any>(
    'SELECT id, name, slug, price, salePrice, images FROM Product WHERE categoryId = ? AND isActive = 1 AND id != ? LIMIT 4',
    [product.categoryId, product.id]
  );

  return (
    <div className="max-w-7xl mx-auto px-3 py-4">
      <div className="text-sm text-gray-500 mb-3">
        <Link href="/" className="hover:text-brand-600">หน้าแรก</Link> /{' '}
        <Link href={`/products?category=${product.category.slug}`} className="hover:text-brand-600">{product.category.name}</Link> /{' '}
        <span>{product.name}</span>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden grid grid-cols-1 md:grid-cols-2 gap-6 p-4 md:p-6">
        <div>
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border">
            <img src={images[0] || 'https://via.placeholder.com/600'} alt={product.name} className="w-full h-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              {images.map((src: string, i: number) => (
                <div key={i} className="aspect-square rounded border overflow-hidden cursor-pointer hover:border-brand-500">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="text-sm text-gray-500 mb-1">{product.brand || product.category.name}</div>
          <h1 className="text-2xl font-bold text-gray-900">{product.name}</h1>
          <div className="mt-3 flex items-end gap-3">
            {product.salePrice ? (
              <>
                <span className="text-3xl font-extrabold text-brand-600">฿{priceFormat(product.salePrice)}</span>
                <span className="text-lg text-gray-400 line-through">฿{priceFormat(product.price)}</span>
                <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2 py-1 rounded">
                  ลด {Math.round(((product.price - product.salePrice) / product.price) * 100)}%
                </span>
              </>
            ) : (
              <span className="text-3xl font-extrabold text-gray-900">฿{priceFormat(product.price)}</span>
            )}
          </div>
          <div className="mt-2 text-sm">
            สถานะ: {product.stock > 0 ? <span className="text-green-600 font-semibold">มีสินค้า ({product.stock} ชิ้น)</span> : <span className="text-red-600 font-semibold">สินค้าหมด</span>}
          </div>
          <div className="mt-4 text-gray-700 whitespace-pre-line text-sm leading-relaxed">{product.description}</div>
          <AddToCart product={{ id: product.id, name: product.name, price: product.salePrice || product.price, image: images[0], stock: product.stock }} />
        </div>
      </div>

      {related.length > 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-bold mb-3 text-gray-800">สินค้าที่เกี่ยวข้อง</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {related.map(p => {
              const imgs = JSON.parse(p.images || '[]');
              return (
                <Link key={p.id} href={`/products/${p.slug}`} className="bg-white rounded-lg shadow-card hover:shadow-lg overflow-hidden border">
                  <div className="aspect-square bg-gray-100">
                    <img src={imgs[0]} alt={p.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="p-3">
                    <div className="text-sm font-medium line-clamp-2 min-h-[40px]">{p.name}</div>
                    <div className="mt-1 text-brand-600 font-bold">฿{priceFormat(p.salePrice || p.price)}</div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}