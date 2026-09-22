import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { hashPassword, verifyPassword } from '@/lib/password';
import { d1First, d1Run } from '@/lib/d1';

// Change the current user's password. Requires the current password for
// verification — this prevents drive-by session-token abuse if a user leaves
// their browser open.
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { currentPassword?: unknown; newPassword?: unknown; confirmPassword?: unknown };
  const currentPassword = String(body.currentPassword || '');
  const newPassword = String(body.newPassword || '');
  const confirmPassword = String(body.confirmPassword || '');

  if (!currentPassword || !newPassword || !confirmPassword) {
    return NextResponse.json({ error: 'กรุณากรอกข้อมูลให้ครบ' }, { status: 400 });
  }
  if (newPassword.length < 6) {
    return NextResponse.json({ error: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' }, { status: 400 });
  }
  if (newPassword !== confirmPassword) {
    return NextResponse.json({ error: 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน' }, { status: 400 });
  }
  if (newPassword === currentPassword) {
    return NextResponse.json({ error: 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม' }, { status: 400 });
  }

  // Re-fetch with password hash to verify the old password server-side.
  const row = await d1First<any>('SELECT password FROM User WHERE id = ?', [user.id]);
  if (!row) return NextResponse.json({ error: 'ไม่พบผู้ใช้' }, { status: 404 });

  const ok = await verifyPassword(currentPassword, row.password);
  if (!ok) return NextResponse.json({ error: 'รหัสผ่านเดิมไม่ถูกต้อง' }, { status: 400 });

  const newHash = await hashPassword(newPassword);
  await d1Run(
    'UPDATE User SET password = ?, updatedAt = ? WHERE id = ?',
    [newHash, new Date().toISOString(), user.id]
  );

  return NextResponse.json({ success: true });
}