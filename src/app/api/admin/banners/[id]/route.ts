import { NextRequest, NextResponse } from 'next/server';
import { d1Run } from '@/lib/d1';
import { requireAdmin } from '@/lib/auth';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  const data = await req.json() as any;
  await d1Run(
    'UPDATE Banner SET title = ?, image = ?, link = ?, subtitle = ?, position = ?, sortOrder = ?, isActive = ? WHERE id = ?',
    [data.title, data.image, data.link || null, data.subtitle || null, data.position || 'hero', data.sortOrder || 0, data.isActive ? 1 : 0, params.id]
  );
  return NextResponse.json({ success: true, banner: { id: params.id, ...data } });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try { await requireAdmin(); } catch { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }
  await d1Run('DELETE FROM Banner WHERE id = ?', [params.id]);
  return NextResponse.json({ success: true });
}