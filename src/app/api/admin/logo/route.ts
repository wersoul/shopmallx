import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { setRequestOrigin } from '@/lib/d1';
import { uploadFile, uploadBytes, deleteByUrl } from '@/lib/r2';
import { d1First, d1Run } from '@/lib/d1';
import { generateFavicons } from '@/lib/favicon';

export const runtime = 'edge';

/**
 * Upload a store logo into the `branding/` folder of the R2 bucket and persist
 * the resulting URL under the Setting row keyed `logo_url`.
 *
 * POST /api/admin/logo
 *   multipart/form-data with `file` field.
 *
 * DELETE /api/admin/logo
 *   clears `logo_url` (the R2 object is left in place to allow re-use).
 */
export async function POST(req: NextRequest) {
  try { setRequestOrigin(new URL(req.url).origin); } catch {}
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'ต้องส่งไฟล์แบบ multipart/form-data' }, { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'ไม่พบไฟล์ (ต้องมี field ชื่อ file)' }, { status: 400 });
  }
  if (!file.type.startsWith('image/')) {
    return NextResponse.json({ error: 'ต้องเป็นไฟล์รูปภาพเท่านั้น' }, { status: 400 });
  }
  if (file.size > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'ไฟล์ใหญ่เกิน 5MB' }, { status: 400 });
  }

  let uploaded: { url: string; key: string };
  try {
    uploaded = await uploadFile(file, 'branding');
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'อัปโหลดไม่สำเร็จ' }, { status: 500 });
  }

  // Persist into Setting
  const now = new Date().toISOString();
  const existing = await d1First<any>('SELECT id FROM Setting WHERE key = ?', ['logo_url']);
  if (existing) {
    await d1Run('UPDATE Setting SET value = ?, updatedAt = ? WHERE id = ?',
      [uploaded.url, now, existing.id]);
  } else {
    await d1Run(
      'INSERT INTO Setting (id, key, value, updatedAt) VALUES (?, ?, ?, ?)',
      ['s_logo_' + Date.now().toString(36), 'logo_url', uploaded.url, now]
    );
  }

  // Auto-generate favicons from the uploaded logo (skip SVGs - browsers
  // handle them natively, and resizing raster-to-vector isn't useful).
  let favicons: { icoUrl?: string; png32Url?: string; appleTouchUrl?: string } = {};
  if (file.type !== 'image/svg+xml') {
    try {
      const buf = new Uint8Array(await file.arrayBuffer());
      const { ico, png32, apple } = await generateFavicons(buf);
      const [icoUp, pngUp, appleUp] = await Promise.all([
        uploadBytes(ico.bytes, 'image/png', 'branding/favicons', 'favicon.ico'),
        uploadBytes(png32.bytes, 'image/png', 'branding/favicons', 'favicon-32x32.png'),
        uploadBytes(apple.bytes, 'image/png', 'branding/favicons', 'apple-touch-icon.png')
      ]);
      // Clean up previous favicons from R2 to avoid bucket clutter.
      const oldFavicon = await d1First<{ value: string }>('SELECT value FROM Setting WHERE key = ?', ['favicon_url']);
      const oldPng32 = await d1First<{ value: string }>('SELECT value FROM Setting WHERE key = ?', ['favicon_32_url']);
      const oldApple = await d1First<{ value: string }>('SELECT value FROM Setting WHERE key = ?', ['apple_touch_url']);
      if (oldFavicon?.value) await deleteByUrl(oldFavicon.value);
      if (oldPng32?.value) await deleteByUrl(oldPng32.value);
      if (oldApple?.value) await deleteByUrl(oldApple.value);

      // Persist URLs.
      await upsertSetting('favicon_url', icoUp.url);
      await upsertSetting('favicon_32_url', pngUp.url);
      await upsertSetting('apple_touch_url', appleUp.url);

      favicons = { icoUrl: icoUp.url, png32Url: pngUp.url, appleTouchUrl: appleUp.url };
    } catch (e: any) {
      // Favicon generation is best-effort - logo upload still succeeds.
      console.error('Favicon generation failed:', e?.message || e);
    }
  }

  return NextResponse.json({ success: true, url: uploaded.url, key: uploaded.key, favicons });
}

async function upsertSetting(key: string, value: string) {
  const now = new Date().toISOString();
  const existing = await d1First<any>('SELECT id FROM Setting WHERE key = ?', [key]);
  if (existing) {
    await d1Run('UPDATE Setting SET value = ?, updatedAt = ? WHERE id = ?', [value, now, existing.id]);
  } else {
    await d1Run(
      'INSERT INTO Setting (id, key, value, updatedAt) VALUES (?, ?, ?, ?)',
      ['s_fav_' + key + '_' + Date.now().toString(36), key, value, now]
    );
  }
}

export async function DELETE() {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const existing = await d1First<any>('SELECT id FROM Setting WHERE key = ?', ['logo_url']);
  if (existing) {
    await d1Run('DELETE FROM Setting WHERE id = ?', [existing.id]);
  }
  // Also remove the auto-generated favicons so the layout stops pointing at them.
  for (const key of ['favicon_url', 'favicon_32_url', 'apple_touch_url']) {
    const row = await d1First<any>('SELECT id, value FROM Setting WHERE key = ?', [key]);
    if (row) {
      await d1Run('DELETE FROM Setting WHERE id = ?', [row.id]);
      if (row.value) await deleteByUrl(row.value);
    }
  }
  return NextResponse.json({ success: true });
}