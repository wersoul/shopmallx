/**
 * R2 upload helper. Used by /api/uploads and bulk product APIs to push
 * files from multipart form-data into the R2 bucket and return a public URL.
 *
 * Folder layout:
 *   products/{productId}/{timestamp}-{slug}.{ext}
 *   categories/{timestamp}-{slug}.{ext}
 *   banners/{timestamp}-{slug}.{ext}
 *   promotions/{timestamp}-{slug}.{ext}
 *   bulk/{timestamp}-{slug}.{ext}
 */
import { getR2, getR2PublicBase } from './d1';

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/svg+xml']);
const EXT_BY_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/avif': 'avif',
  'image/svg+xml': 'svg'
};

function extFromName(name: string, type: string): string {
  const m = name.match(/\.([a-zA-Z0-9]+)$/);
  if (m) return m[1].toLowerCase();
  return EXT_BY_TYPE[type] || 'bin';
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .replace(/\.[a-z0-9]+$/i, '')
    .replace(/[^a-z0-9ก-๙-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60) || 'file';
}

export interface UploadResult {
  key: string;
  url: string;
  size: number;
  type: string;
  name: string;
}

/**
 * Upload a File / Blob to R2 and return its public URL.
 * If R2 binding or public base URL is unavailable, throws.
 */
export async function uploadFile(file: File, folder: string): Promise<UploadResult> {
  const r2 = getR2();
  if (!r2) throw new Error('R2 binding not available');
  const base = getR2PublicBase();
  if (!base) throw new Error('R2_PUBLIC_BASE is not configured');

  if (!ALLOWED.has(file.type)) {
    throw new Error(`Unsupported file type: ${file.type}`);
  }
  const ext = extFromName(file.name, file.type);
  const safeName = slug(file.name);
  const key = `${folder.replace(/\/+$/, '')}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}.${ext}`;

  const buf = await file.arrayBuffer();
  await r2.put(key, buf, {
    httpMetadata: { contentType: file.type },
    customMetadata: { originalName: file.name }
  });
  return {
    key,
    url: `${base}/${key}`,
    size: buf.byteLength,
    type: file.type,
    name: file.name
  };
}

/**
 * Delete an R2 object by its full public URL (best-effort).
 */
export async function deleteByUrl(url: string): Promise<void> {
  const r2 = getR2();
  if (!r2) return;
  const base = getR2PublicBase();
  if (!base || !url.startsWith(base + '/')) return;
  const key = url.slice(base.length + 1);
  try {
    await r2.delete(key);
  } catch {}
}