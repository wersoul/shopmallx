'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiTrash2 } from 'react-icons/fi';
import { priceFormat } from '@/lib/settings';

export default function CartPage() {
  const [items, setItems] = useState<any[]>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setItems(JSON.parse(localStorage.getItem('cart') || '[]'));
    const update = () => setItems(JSON.parse(localStorage.getItem('cart') || '[]'));
    window.addEventListener('cartUpdate', update);
    return () => window.removeEventListener('cartUpdate', update);
  }, []);

  const save = (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem('cart', JSON.stringify(newItems));
    window.dispatchEvent(new Event('cartUpdate'));
  };

  const updateQty = (productId: string, q: number) => {
    if (q < 1) return remove(productId);
    save(items.map(i => i.productId === productId ? { ...i, quantity: q } : i));
  };

  const remove = (productId: string) => {
    save(items.filter(i => i.productId !== productId));
  };

  const total = items.reduce((s, i) => s + i.price * i.quantity, 0);

  if (!mounted) return null;

  return (
    <div className="max-w-5xl mx-auto px-3 py-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">ตะกร้าสินค้า ({items.length})</h1>

      {items.length === 0 ? (
        <div className="bg-white rounded-lg shadow-card p-10 text-center">
          <div className="text-6xl mb-2">🛒</div>
          <p className="text-gray-500 mb-4">ไม่มีสินค้าในตะกร้า</p>
          <Link href="/products" className="inline-block bg-brand-600 text-white px-6 py-2 rounded hover:bg-brand-700">เลือกซื้อสินค้า</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-lg shadow-card divide-y">
            {items.map(i => (
              <div key={i.productId} className="flex gap-3 p-3">
                <img src={i.image} alt={i.name} className="w-20 h-20 rounded object-cover bg-gray-100" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm line-clamp-2">{i.name}</div>
                  <div className="text-brand-600 font-bold mt-1">฿{priceFormat(i.price)}</div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center border rounded">
                      <button onClick={() => updateQty(i.productId, i.quantity - 1)} className="px-2 py-0.5 hover:bg-gray-100">−</button>
                      <span className="px-3">{i.quantity}</span>
                      <button onClick={() => updateQty(i.productId, i.quantity + 1)} className="px-2 py-0.5 hover:bg-gray-100">+</button>
                    </div>
                    <button onClick={() => remove(i.productId)} className="text-red-600 hover:bg-red-50 rounded p-1"><FiTrash2 /></button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-white rounded-lg shadow-card p-4 h-fit sticky top-32">
            <h3 className="font-bold mb-3">สรุปคำสั่งซื้อ</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span>รวม {items.reduce((s, i) => s + i.quantity, 0)} ชิ้น</span><span>฿{priceFormat(total)}</span></div>
              <div className="flex justify-between text-gray-500"><span>ค่าจัดส่ง</span><span>คำนวณตอน checkout</span></div>
            </div>
            <div className="border-t mt-3 pt-3 flex justify-between font-bold text-lg">
              <span>รวมทั้งสิ้น</span><span className="text-brand-600">฿{priceFormat(total)}</span>
            </div>
            <Link href="/checkout" className="mt-4 block w-full bg-brand-600 hover:bg-brand-700 text-white text-center py-3 rounded font-semibold">
              ดำเนินการสั่งซื้อ →
            </Link>
            <Link href="/products" className="mt-2 block text-center text-sm text-brand-600 hover:underline">← เลือกซื้อสินค้าต่อ</Link>
          </div>
        </div>
      )}
    </div>
  );
}