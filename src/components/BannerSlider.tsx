'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BannerSlider({ banners }: { banners: any[] }) {
  const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (banners.length <= 1) return;
    const t = setInterval(() => setIdx(i => (i + 1) % banners.length), 5000);
    return () => clearInterval(t);
  }, [banners.length]);

  if (!banners.length) return null;
  const active = banners[idx];

  return (
    <div className="relative w-full h-[180px] sm:h-[280px] md:h-[380px] lg:h-[420px] rounded-xl overflow-hidden shadow-lg">
      {banners.map((b, i) => (
        <Link href={b.link || '#'} key={b.id}
          className={`absolute inset-0 transition-opacity duration-700 ${i === idx ? 'opacity-100' : 'opacity-0'}`}>
          <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 flex items-center px-6 md:px-12">
            <div className="text-white max-w-xl">
              <h2 className="text-2xl md:text-5xl font-extrabold drop-shadow-lg mb-2">{b.title}</h2>
              <p className="text-sm md:text-xl opacity-90 drop-shadow">{b.subtitle}</p>
              <span className="inline-block mt-4 bg-brand-600 hover:bg-brand-700 px-5 py-2 rounded-full text-sm font-semibold">เลือกซื้อเลย →</span>
            </div>
          </div>
        </Link>
      ))}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {banners.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-2 h-2 rounded-full transition-all ${i === idx ? 'bg-white w-6' : 'bg-white/50'}`} />
        ))}
      </div>
      <button onClick={() => setIdx(i => (i - 1 + banners.length) % banners.length)}
        className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center">‹</button>
      <button onClick={() => setIdx(i => (i + 1) % banners.length)}
        className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 hover:bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center">›</button>
    </div>
  );
}