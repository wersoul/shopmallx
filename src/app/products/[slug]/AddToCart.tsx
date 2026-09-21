'use client';
import { useState } from 'react';
import { FiShoppingCart, FiCheck } from 'react-icons/fi';

export default function AddToCart({ product }: { product: any }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);

  const add = () => {
    const items = JSON.parse(localStorage.getItem('cart') || '[]');
    const ex = items.find((i: any) => i.productId === product.id);
    if (ex) ex.quantity += qty;
    else items.push({ productId: product.id, quantity: qty, name: product.name, price: product.price, image: product.image });
    localStorage.setItem('cart', JSON.stringify(items));
    window.dispatchEvent(new Event('cartUpdate'));
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="mt-6 border-t pt-4">
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">จำนวน:</span>
        <div className="flex items-center border rounded">
          <button onClick={() => setQty(q => Math.max(1, q - 1))} className="px-3 py-1 hover:bg-gray-100">−</button>
          <input value={qty} onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            className="w-14 text-center py-1 outline-none" />
          <button onClick={() => setQty(q => q + 1)} className="px-3 py-1 hover:bg-gray-100">+</button>
        </div>
      </div>
      <div className="mt-4 flex gap-2">
        <button onClick={add} disabled={product.stock === 0}
          className="flex-1 bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded flex items-center justify-center gap-2">
          {added ? <><FiCheck /> เพิ่มแล้ว</> : <><FiShoppingCart /> หยิบใส่ตะกร้า</>}
        </button>
      </div>
    </div>
  );
}