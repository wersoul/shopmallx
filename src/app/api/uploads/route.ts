import { NextRequest, NextResponse } from 'next/server';
import { uploadFile } from '@/lib/r2';
import { requireAdmin } from '@/lib/auth';

// Increase body size limit for image uploads — already configured in next.config.js
export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const form = await req.formData();
  const folder = String(form.get('folder') || 'misc');
  const files = form.getAll('files') as File[];
  if (!files.length) return NextResponse.json({ error: 'ไม่มีไฟล์' }, { status: 400 });
  const out: any[] = [];
  for (const f of files) {
    try {
      const r = await uploadFile(f, folder);
      out.push({ success: true, url: r.url, key: r.key, name: r.name });
    } catch (e: any) {
      out.push({ success: false, name: f.name, error: e?.message || 'upload failed' });
    }
  }
  return NextResponse.json({ success: true, files: out });
}