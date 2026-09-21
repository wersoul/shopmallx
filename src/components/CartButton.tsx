'use client';
import { useEffect, useState } from 'react';
import { FiShoppingCart } from 'react-icons/fi';
import Link from 'next/link';

export default function CartButton() {
  const [count, setCount] = useState(0);
  useEffect(() => {
    const update = () => {
      const items = JSON.parse(localStorage.getItem('cart') || '[]');
      setCount(items.reduce((s: number, i: any) => s + i.quantity, 0));
    };
    update();
    window.addEventListener('cartUpdate', update);
    return () => window.removeEventListener('cartUpdate', update);
  }, []);
  return (
    <Link href="/cart" className="fixed bottom-4 right-4 z-30 bg-brand-600 hover:bg-brand-700 text-white rounded-full shadow-lg px-4 py-3 flex items-center gap-2">
      <FiShoppingCart className="text-xl" />
      <span className="font-semibold">{count}</span>
      {count > 0 && <span className="text-xs">ตะกร้า</span>}
    </Link>
  );
}