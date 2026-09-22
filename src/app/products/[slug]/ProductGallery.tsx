'use client';
import { useState } from 'react';
import { FiZoomIn } from 'react-icons/fi';
import ImageLightbox from '@/components/ImageLightbox';

interface Props {
  images: string[];
  name: string;
}

/**
 * Product gallery: main image + thumbnails.
 *
 * - Click the main image (or a thumbnail) to open a fullscreen lightbox.
 * - Click a thumbnail to swap it into the main view.
 * - Images use `object-contain` so wide spec tables / tall portraits are
 *   never cropped — they fit inside the square box on a clean white bg.
 */
export default function ProductGallery({ images, name }: Props) {
  const list = images.length > 0 ? images : ['https://via.placeholder.com/600?text=No+Image'];
  const [activeIdx, setActiveIdx] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);

  const openLightboxAt = (idx: number) => {
    setLightboxStart(idx);
    setLightboxOpen(true);
  };

  const active = list[activeIdx] ?? list[0];

  return (
    <div>
      {/* Main image — clickable to open lightbox. */}
      <button
        type="button"
        aria-label={`ดูรูป ${name} ขนาดใหญ่`}
        onClick={() => openLightboxAt(activeIdx)}
        className="block w-full aspect-square rounded-lg overflow-hidden bg-white border group relative cursor-zoom-in"
      >
        <img
          src={active}
          alt={name}
          className="w-full h-full object-contain p-2 transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <span className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-700 text-xs font-medium px-2 py-1 rounded shadow flex items-center gap-1">
          <FiZoomIn /> คลิกดูรูป
        </span>
      </button>

      {/* Thumbnails — click swaps the main image; double-click opens lightbox. */}
      {list.length > 1 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {list.map((src, i) => {
            const isActive = i === activeIdx;
            return (
              <button
                key={i}
                type="button"
                aria-label={`${name} รูปที่ ${i + 1}`}
                aria-current={isActive ? 'true' : undefined}
                onClick={() => setActiveIdx(i)}
                onDoubleClick={() => openLightboxAt(i)}
                className={`aspect-square rounded border overflow-hidden bg-white p-1 transition-colors ${
                  isActive ? 'border-brand-500 ring-2 ring-brand-200' : 'border-gray-200 hover:border-brand-500'
                }`}
              >
                <img src={src} alt="" className="w-full h-full object-contain" />
              </button>
            );
          })}
        </div>
      )}

      <ImageLightbox
        images={list.map((src, i) => ({ src, alt: `${name} รูปที่ ${i + 1}` }))}
        startIndex={lightboxStart}
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
      />
    </div>
  );
}