'use client';
import { useEffect, useState } from 'react';
import { FiX, FiChevronLeft, FiChevronRight } from 'react-icons/fi';

export interface LightboxImage {
  src: string;
  alt?: string;
}

interface Props {
  images: LightboxImage[];
  /** Index of the image to show when the lightbox opens. */
  startIndex?: number;
  /** Whether the lightbox is visible. */
  open: boolean;
  /** Called when the user dismisses the lightbox (close button, ESC, backdrop click). */
  onClose: () => void;
}

/**
 * Fullscreen image lightbox / popup.
 *
 * - Click backdrop, press ESC, or hit the X button to close.
 * - Arrow keys / on-screen buttons to navigate when more than one image.
 * - Body scroll is locked while open.
 * - Renders nothing on the server (only when `open` flips true on the client).
 */
export default function ImageLightbox({ images, startIndex = 0, open, onClose }: Props) {
  const len = images.length;
  const safeStart = len > 0 ? Math.min(Math.max(startIndex, 0), len - 1) : 0;
  const [active, setActive] = useState(safeStart);

  // Reset to the caller's startIndex whenever the lightbox opens again.
  useEffect(() => {
    if (open) setActive(safeStart);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Keyboard + body-scroll lock.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight' && len > 1) setActive(a => (a + 1) % len);
      else if (e.key === 'ArrowLeft' && len > 1) setActive(a => (a - 1 + len) % len);
    };
    document.addEventListener('keydown', onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose, len]);

  if (!open || len === 0) return null;
  const current = images[active] ?? images[0];

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActive(a => (a - 1 + len) % len);
  };
  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActive(a => (a + 1) % len);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="ดูรูปภาพขนาดใหญ่"
      className="fixed inset-0 z-[100] bg-black/85 flex items-center justify-center p-4"
      onClick={onClose}
    >
      {/* Close button */}
      <button
        type="button"
        aria-label="ปิด"
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        className="absolute top-3 right-3 md:top-5 md:right-5 w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center text-2xl transition-colors"
      >
        <FiX />
      </button>

      {/* Prev / Next */}
      {len > 1 && (
        <>
          <button
            type="button"
            aria-label="รูปก่อนหน้า"
            onClick={goPrev}
            className="absolute left-2 md:left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center text-2xl transition-colors"
          >
            <FiChevronLeft />
          </button>
          <button
            type="button"
            aria-label="รูปถัดไป"
            onClick={goNext}
            className="absolute right-2 md:right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center text-2xl transition-colors"
          >
            <FiChevronRight />
          </button>
        </>
      )}

      {/* Image */}
      <figure
        className="relative max-w-[95vw] max-h-[90vh] flex flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={current.src}
          alt={current.alt || ''}
          className="max-w-[95vw] max-h-[85vh] object-contain rounded shadow-2xl"
        />
        {len > 1 && (
          <figcaption className="mt-3 text-white/80 text-sm">
            {active + 1} / {len}
            {current.alt && <span className="ml-2">— {current.alt}</span>}
          </figcaption>
        )}
      </figure>
    </div>
  );
}