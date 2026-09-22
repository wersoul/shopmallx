import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { setRequestOrigin } from '@/lib/d1';
import { uploadFile } from '@/lib/r2';
import { d1First, d1Run } from '@/lib/d1';

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

  return NextResponse.json({ success: true, url: uploaded.url, key: uploaded.key });
}

export async function DELETE() {
  try { await requireAdmin(); } catch {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const existing = await d1First<any>('SELECT id FROM Setting WHERE key = ?', ['logo_url']);
  if (existing) {
    await d1Run('DELETE FROM Setting WHERE id = ?', [existing.id]);
  }
  return NextResponse.json({ success: true });
}