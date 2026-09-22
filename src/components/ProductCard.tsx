'use client';
import Link from 'next/link';
import { useState } from 'react';
import { FiShoppingCart, FiZoomIn } from 'react-icons/fi';
import { priceFormat } from '@/lib/settings';
import ImageLightbox from './ImageLightbox';

export default function ProductCard({ product }: { product: any }) {
  const images: string[] = JSON.parse(product.images || '[]');
  const img = images[0] || 'https://via.placeholder.com/400x400?text=No+Image';
  const discount = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const addToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    const ex = items.find((i: any) => i.productId === product.id);
    if (ex) ex.quantity += 1;
    else items.push({ productId: product.id, quantity: 1, name: product.name, price: product.salePrice || product.price, image: img });
    localStorage.setItem('cart', JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdate'));
    alert(`เพิ่ม "${product.name}" ลงตะกร้าแล้ว`);
  };

  const openLightbox = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setLightboxOpen(true);
  };

  return (
    <div className="group bg-white rounded-lg shadow-card hover:shadow-lg overflow-hidden border border-gray-100 transition-all hover:-translate-y-1">
      <div className="relative aspect-square overflow-hidden bg-white">
        {/* Image — fits inside the card without being cropped. */}
        <img
          src={img}
          alt={product.name}
          className="w-full h-full object-contain p-2 group-hover:scale-[1.03] transition-transform duration-300"
        />
        {/* Click overlay opens the lightbox. Uses a button (not a Link) so
            clicks don't follow the product link — the title link below does. */}
        <button
          type="button"
          aria-label={`ดูรูป ${product.name} ขนาดใหญ่`}
          onClick={openLightbox}
          className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/15 transition-colors cursor-zoom-in"
        >
          <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded shadow flex items-center gap-1">
            <FiZoomIn /> คลิกดูรูป
          </span>
        </button>

        {product.isNew && <span className="absolute top-2 left-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none">ใหม่</span>}
        {discount > 0 && <span className="absolute top-2 right-2 bg-brand-600 text-white text-[10px] font-bold px-2 py-1 rounded pointer-events-none">-{discount}%</span>}
        {product.stock === 0 && <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white font-bold pointer-events-none">หมด</div>}
      </div>
      <div className="p-3">
        <div className="text-xs text-gray-500 mb-1">{product.brand || ''}</div>
        <h3 className="text-sm font-medium line-clamp-2 min-h-[40px]">
          <Link href={`/products/${product.slug}`} className="hover:text-brand-600">
            {product.name}
          </Link>
        </h3>
        <div className="mt-2 flex items-end gap-2">
          {product.salePrice ? (
            <>
              <span className="text-lg font-bold text-brand-600">฿{priceFormat(product.salePrice)}</span>
              <span className="text-xs text-gray-400 line-through">฿{priceFormat(product.price)}</span>
            </>
          ) : (
            <span className="text-lg font-bold text-gray-900">฿{priceFormat(product.price)}</span>
          )}
        </div>
        <button onClick={addToCart} disabled={product.stock === 0} className="mt-3 w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white text-sm py-2 rounded flex items-center justify-center gap-1">
          <FiShoppingCart /> หยิบใส่ตะกร้า
        </button>
      </div>

      <ImageLightbox
        images={images.map((src, i) => ({ src, alt: `${product.name} รูปที่ ${i + 1}` }))}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}