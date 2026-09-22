/**
 * Auto-generate favicon assets from an uploaded store logo.
 *
 * Workflow (Edge runtime compatible via @cf-wasm/photon WASM):
 *   1. receive source bytes (PNG/JPEG/WebP/...) uploaded by admin
 *   2. decode via PhotonImage.new_from_byteslice
 *   3. produce 3 outputs (all PNG so we don't need a separate ICO encoder):
 *        - 32x32   → favicon.ico   (modern browsers accept PNG-encoded .ico)
 *        - 32x32   → favicon-32x32.png (legacy <link rel="icon" sizes="32x32">)
 *        - 180x180 → apple-touch-icon.png
 *
 * The upload happens at /api/admin/logo right after the original logo is
 * uploaded to R2; we save URLs in D1 `Setting` rows:
 *   - `favicon_url`         → branding/favicons/favicon.ico
 *   - `favicon_32_url`      → branding/favicons/favicon-32x32.png
 *   - `apple_touch_url`     → branding/favicons/apple-touch-icon.png
 *
 * SVGs are passed through (no resize) since the browser renders vectors.
 */
import { PhotonImage, SamplingFilter, resize } from '@cf-wasm/photon';

export interface FaviconOutput {
  bytes: Uint8Array;
  type: 'image/png';
}

/** Resize raw image bytes to (w, h) and return PNG bytes. */
export async function resizeToPng(src: Uint8Array, w: number, h: number): Promise<FaviconOutput> {
  // The `workerd` build initializes photon synchronously at module load, so
  // we don't need to call initPhoton() ourselves here.
  const original = PhotonImage.new_from_byteslice(src);
  let resized: PhotonImage | null = null;
  try {
    // `resize` returns a NEW PhotonImage (immutable in this WASM build).
    resized = resize(original, w, h, SamplingFilter.Lanczos3);
    const out = resized.get_bytes(); // PNG bytes
    return { bytes: out, type: 'image/png' };
  } finally {
    original.free();
    if (resized) resized.free();
  }
}

/** Build a PNG-encoded "ICO" container that browsers happily render. */
export async function makeFaviconIco(src: Uint8Array): Promise<FaviconOutput> {
  // 32x32 PNG - most browsers (Chrome/Edge/Firefox/Safari) accept PNG-encoded
  // .ico containers, and this avoids shipping a separate ICO encoder.
  return resizeToPng(src, 32, 32);
}

/** Generate the full set of favicon assets in parallel. */
export async function generateFavicons(src: Uint8Array): Promise<{
  ico: FaviconOutput;
  png32: FaviconOutput;
  apple: FaviconOutput;
}> {
  const [ico, png32, apple] = await Promise.all([
    makeFaviconIco(src),
    resizeToPng(src, 32, 32),
    resizeToPng(src, 180, 180)
  ]);
  return { ico, png32, apple };
}