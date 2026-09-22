import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { d1Run } from '@/lib/d1';

// Update the currently-logged-in user's profile fields (name, phone, address,
// province, postalCode). Email and role are intentionally immutable from the
// customer self-edit flow — admins should change those from the admin panel
// instead.
export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'ไม่ได้เข้าสู่ระบบ' }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as {
    name?: unknown; phone?: unknown; address?: unknown;
    province?: unknown; postalCode?: unknown;
  };
  const name = String(body.name || '').trim();
  const phone = body.phone != null ? String(body.phone).trim() : '';
  const address = body.address != null ? String(body.address).trim() : '';
  const province = body.province != null ? String(body.province).trim() : '';
  const postalCode = body.postalCode != null ? String(body.postalCode).trim() : '';

  if (!name) return NextResponse.json({ error: 'กรุณากรอกชื่อ' }, { status: 400 });
  if (name.length > 100) return NextResponse.json({ error: 'ชื่อยาวเกินไป' }, { status: 400 });
  if (phone && !/^[0-9+\-\s()]{6,20}$/.test(phone)) {
    return NextResponse.json({ error: 'รูปแบบเบอร์โทรไม่ถูกต้อง' }, { status: 400 });
  }
  if (address.length > 500) {
    return NextResponse.json({ error: 'ที่อยู่ยาวเกินไป' }, { status: 400 });
  }
  if (province.length > 100) {
    return NextResponse.json({ error: 'จังหวัดยาวเกินไป' }, { status: 400 });
  }
  // Thai postal codes are exactly 5 digits. Allow empty string (=clear), but
  // if filled it must match — keeps typo'd forms from silently saving.
  if (postalCode && !/^[0-9]{5}$/.test(postalCode)) {
    return NextResponse.json({ error: 'รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก' }, { status: 400 });
  }

  await d1Run(
    'UPDATE User SET name = ?, phone = ?, address = ?, province = ?, postalCode = ?, updatedAt = ? WHERE id = ?',
    [name, phone || null, address || null, province || null, postalCode || null, new Date().toISOString(), user.id]
  );

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      email: user.email,
      name,
      role: user.role,
      phone: phone || null,
      address: address || null,
      province: province || null,
      postalCode: postalCode || null
    }
  });
}