import { NextRequest, NextResponse } from 'next/server';
import { d1All, d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';
import { uploadFile } from '@/lib/r2';

function genId() {
  return 'p_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function slugify(s: string) {
  return (s || '').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 80);
}

function nameFromFilename(filename: string) {
  // strip extension, then replace _/- with spaces and title-case-ish
  const base = filename.replace(/\.[a-z0-9]+$/i, '');
  const cleaned = base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return cleaned || filename;
}

/**
 * Bulk-create products from N uploaded images. Each image becomes one product.
 * Required form fields:
 *   - files[]        — image files
 *   - folder         — R2 folder (defaults to "products/bulk")
 *   - categoryId     — parent category (required)
 *   - subCategoryId  — optional
 *   - price          — number, applied to all products
 *   - stock          — number, applied to all products (default 9999)
 *   - brand          — optional
 */
export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const form = await req.formData();
  const files = form.getAll('files') as File[];
  if (!files.length) return NextResponse.json({ error: 'ไม่มีไฟล์' }, { status: 400 });
  const categoryId = String(form.get('categoryId') || '');
  if (!categoryId) return NextResponse.json({ error: 'กรุณาเลือกหมวดหมู่' }, { status: 400 });
  const subCategoryId = form.get('subCategoryId') ? String(form.get('subCategoryId')) : null;
  const price = parseFloat(String(form.get('price') || '0')) || 0;
  const stock = parseInt(String(form.get('stock') || '9999')) || 9999;
  const brand = form.get('brand') ? String(form.get('brand')) : null;
  const folder = String(form.get('folder') || 'products/bulk');
  const isFeatured = form.get('isFeatured') === 'true' || form.get('isFeatured') === '1';

  const now = new Date().toISOString();
  const created: any[] = [];
  const failed: any[] = [];

  for (const file of files) {
    let url = '';
    try {
      const up = await uploadFile(file, folder);
      url = up.url;
    } catch (e: any) {
      failed.push({ name: file.name, error: 'upload ล้มเหลว: ' + (e?.message || e) });
      continue;
    }
    try {
      const name = nameFromFilename(file.name);
      const id = genId();
      const slug = slugify(name) + '-' + id.slice(2, 8);
      await d1Run(
        `INSERT INTO Product
         (id, name, slug, description, price, salePrice, stock, images, brand,
          isActive, isFeatured, isNew, categoryId, subCategoryId, createdAt, updatedAt)
         VALUES (?, ?, ?, ?, ?, NULL, ?, ?, ?, 1, ?, 1, ?, ?, ?, ?)`,
        [
          id, name, slug,
          '',
          price,
          stock,
          JSON.stringify([url]),
          brand,
          isFeatured ? 1 : 0,
          categoryId,
          subCategoryId,
          now, now
        ]
      );
      created.push({ id, name, image: url });
    } catch (e: any) {
      failed.push({ name: file.name, error: 'บันทึกไม่สำเร็จ: ' + (e?.message || e) });
    }
  }

  return NextResponse.json({
    success: true,
    createdCount: created.length,
    failedCount: failed.length,
    created,
    failed
  });
}