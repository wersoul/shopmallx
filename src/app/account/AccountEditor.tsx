'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FiUser, FiPhone, FiMapPin, FiMail, FiLock, FiSave, FiCheck,
  FiPackage, FiSettings, FiAlertCircle
} from 'react-icons/fi';

type AccountUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  phone: string;
  address: string;
  province: string;
  postalCode: string;
  createdAt: string;
};

export default function AccountEditor({
  user, ordersCount, pendingCount
}: {
  user: AccountUser;
  ordersCount: number;
  pendingCount: number;
}) {
  const router = useRouter();

  // Profile fields (name, phone, address, province, postalCode).
  const [profile, setProfile] = useState({
    name: user.name,
    phone: user.phone,
    address: user.address,
    province: user.province,
    postalCode: user.postalCode
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMsg, setProfileMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  // Password change fields.
  const [pw, setPw] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwSaving, setPwSaving] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);
  const [showPw, setShowPw] = useState(false);

  const dirtyProfile =
    profile.name !== user.name ||
    profile.phone !== user.phone ||
    profile.address !== user.address ||
    profile.province !== user.province ||
    profile.postalCode !== user.postalCode;

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileMsg(null);
    if (!profile.name.trim()) {
      setProfileMsg({ kind: 'err', text: 'กรุณากรอกชื่อ' });
      return;
    }
    setProfileSaving(true);
    try {
      const res = await fetch('/api/account/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) {
        setProfileMsg({ kind: 'ok', text: 'บันทึกข้อมูลเรียบร้อย' });
        // Refresh server components so Header / checkout prefill pick up the change.
        router.refresh();
      } else {
        setProfileMsg({ kind: 'err', text: data.error || 'บันทึกไม่สำเร็จ' });
      }
    } catch {
      setProfileMsg({ kind: 'err', text: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' });
    } finally {
      setProfileSaving(false);
    }
  };

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.newPassword.length < 6) {
      setPwMsg({ kind: 'err', text: 'รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร' });
      return;
    }
    if (pw.newPassword !== pw.confirmPassword) {
      setPwMsg({ kind: 'err', text: 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน' });
      return;
    }
    setPwSaving(true);
    try {
      const res = await fetch('/api/account/password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pw)
      });
      const data = await res.json() as { success?: boolean; error?: string };
      if (data.success) {
        setPwMsg({ kind: 'ok', text: 'เปลี่ยนรหัสผ่านเรียบร้อย' });
        setPw({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setPwMsg({ kind: 'err', text: data.error || 'เปลี่ยนรหัสผ่านไม่สำเร็จ' });
      }
    } catch {
      setPwMsg({ kind: 'err', text: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้' });
    } finally {
      setPwSaving(false);
    }
  };

  const initial = (profile.name || user.email).charAt(0).toUpperCase();
  const isAdmin = user.role === 'admin';

  return (
    <div className="max-w-5xl mx-auto px-3 py-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">บัญชีของฉัน</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sidebar: avatar + meta */}
        <div className="bg-white rounded-lg shadow-card p-4 md:col-span-1 h-fit">
          <div className="w-20 h-20 bg-brand-100 rounded-full mx-auto flex items-center justify-center text-3xl text-brand-600 font-bold">
            {initial}
          </div>
          <div className="text-center mt-3">
            <div className="font-bold">{profile.name || user.name}</div>
            <div className="text-sm text-gray-500 flex items-center justify-center gap-1 mt-0.5">
              <FiMail className="text-xs" /> {user.email}
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {isAdmin ? 'ผู้ดูแลระบบ' : 'ลูกค้า'}
            </div>
          </div>
          <div className="mt-4 border-t pt-4 space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-500">เบอร์โทร:</span>
              <span className="font-medium text-right">{profile.phone || '-'}</span>
            </div>
            {(profile.province || profile.postalCode) && (
              <div className="flex justify-between items-center">
                <span className="text-gray-500">จังหวัด/รหัส:</span>
                <span className="font-medium text-right">
                  {profile.province || '-'}{profile.postalCode ? ` ${profile.postalCode}` : ''}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-gray-500">สมัครเมื่อ:</span>
              <span>{new Date(user.createdAt).toLocaleDateString('th-TH')}</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="bg-brand-50 rounded p-2 text-center">
              <div className="text-lg font-bold text-brand-600">{ordersCount}</div>
              <div className="text-[10px] text-gray-500">คำสั่งซื้อ</div>
            </div>
            <div className="bg-yellow-50 rounded p-2 text-center">
              <div className="text-lg font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-[10px] text-gray-500">รอชำระ</div>
            </div>
          </div>
        </div>

        {/* Main column: edit forms + quick links */}
        <div className="md:col-span-2 space-y-4">
          {/* Profile edit */}
          <div className="bg-white rounded-lg shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiSettings className="text-brand-600" />
              <h2 className="font-bold">ข้อมูลส่วนตัว</h2>
            </div>
            <form onSubmit={saveProfile} className="space-y-3 text-sm">
              <div>
                <label className="text-gray-600 flex items-center gap-1 mb-1">
                  <FiUser className="text-xs" /> ชื่อ-นามสกุล <span className="text-red-500">*</span>
                </label>
                <input
                  required
                  maxLength={100}
                  value={profile.name}
                  onChange={e => setProfile({ ...profile, name: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:border-brand-500 focus:outline-none"
                  placeholder="ชื่อ นามสกุล"
                />
              </div>
              <div>
                <label className="text-gray-600 flex items-center gap-1 mb-1">
                  <FiPhone className="text-xs" /> เบอร์โทร
                </label>
                <input
                  type="tel"
                  maxLength={20}
                  value={profile.phone}
                  onChange={e => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:border-brand-500 focus:outline-none"
                  placeholder="เช่น 0812345678"
                />
              </div>
              <div>
                <label className="text-gray-600 flex items-center gap-1 mb-1">
                  <FiMapPin className="text-xs" /> ที่อยู่จัดส่ง
                </label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={profile.address}
                  onChange={e => setProfile({ ...profile, address: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:border-brand-500 focus:outline-none"
                  placeholder="บ้านเลขที่ ซอย ถนน แขวง/ตำบล เขต/อำเภอ"
                />
                <div className="text-[10px] text-gray-400 text-right">
                  {profile.address.length}/500
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 mb-1 block">จังหวัด</label>
                  <input
                    maxLength={100}
                    value={profile.province}
                    onChange={e => setProfile({ ...profile, province: e.target.value })}
                    className="w-full border rounded px-3 py-2 focus:border-brand-500 focus:outline-none"
                    placeholder="เช่น กรุงเทพมหานคร"
                  />
                </div>
                <div>
                  <label className="text-gray-600 mb-1 block">รหัสไปรษณีย์</label>
                  <input
                    inputMode="numeric"
                    maxLength={5}
                    pattern="[0-9]{5}"
                    value={profile.postalCode}
                    onChange={e => setProfile({ ...profile, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                    className="w-full border rounded px-3 py-2 focus:border-brand-500 focus:outline-none"
                    placeholder="เช่น 10110"
                  />
                </div>
              </div>

              {profileMsg && (
                <div className={`flex items-center gap-2 p-2 rounded text-xs ${
                  profileMsg.kind === 'ok'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {profileMsg.kind === 'ok'
                    ? <FiCheck />
                    : <FiAlertCircle />}
                  {profileMsg.text}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!dirtyProfile || profileSaving}
                  className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center gap-1"
                >
                  <FiSave /> {profileSaving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
                </button>
              </div>
            </form>
          </div>

          {/* Password change */}
          <div className="bg-white rounded-lg shadow-card p-4">
            <div className="flex items-center gap-2 mb-3">
              <FiLock className="text-brand-600" />
              <h2 className="font-bold">เปลี่ยนรหัสผ่าน</h2>
            </div>
            <form onSubmit={changePassword} className="space-y-3 text-sm">
              <div>
                <label className="text-gray-600 mb-1 block">รหัสผ่านปัจจุบัน <span className="text-red-500">*</span></label>
                <input
                  required
                  type={showPw ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={pw.currentPassword}
                  onChange={e => setPw({ ...pw, currentPassword: e.target.value })}
                  className="w-full border rounded px-3 py-2 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-gray-600 mb-1 block">รหัสผ่านใหม่ <span className="text-red-500">*</span></label>
                  <input
                    required
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={6}
                    value={pw.newPassword}
                    onChange={e => setPw({ ...pw, newPassword: e.target.value })}
                    className="w-full border rounded px-3 py-2 focus:border-brand-500 focus:outline-none"
                  />
                  <div className="text-[10px] text-gray-400 mt-1">อย่างน้อย 6 ตัวอักษร</div>
                </div>
                <div>
                  <label className="text-gray-600 mb-1 block">ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span></label>
                  <input
                    required
                    type={showPw ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={6}
                    value={pw.confirmPassword}
                    onChange={e => setPw({ ...pw, confirmPassword: e.target.value })}
                    className="w-full border rounded px-3 py-2 focus:border-brand-500 focus:outline-none"
                  />
                </div>
              </div>
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPw}
                  onChange={e => setShowPw(e.target.checked)}
                  className="accent-brand-600"
                />
                แสดงรหัสผ่าน
              </label>

              {pwMsg && (
                <div className={`flex items-center gap-2 p-2 rounded text-xs ${
                  pwMsg.kind === 'ok'
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                  {pwMsg.kind === 'ok'
                    ? <FiCheck />
                    : <FiAlertCircle />}
                  {pwMsg.text}
                </div>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={pwSaving || !pw.currentPassword || !pw.newPassword || !pw.confirmPassword}
                  className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-2 rounded flex items-center gap-1"
                >
                  <FiLock /> {pwSaving ? 'กำลังเปลี่ยน...' : 'เปลี่ยนรหัสผ่าน'}
                </button>
              </div>
            </form>
          </div>

          {/* Quick links */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link href="/account/orders" className="block bg-white rounded-lg shadow-card p-4 hover:shadow-lg transition">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-bold flex items-center gap-2"><FiPackage /> รายการสั่งซื้อ</div>
                  <div className="text-sm text-gray-500">ดูประวัติการสั่งซื้อทั้งหมด</div>
                </div>
                <span className="text-brand-600">→</span>
              </div>
            </Link>

            {isAdmin && (
              <Link href="/admin" className="block bg-brand-600 text-white rounded-lg shadow-card p-4 hover:bg-brand-700 transition">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="font-bold flex items-center gap-2">⚙ หลังบ้าน (Admin)</div>
                    <div className="text-sm opacity-90">จัดการสินค้า คำสั่งซื้อ ลูกค้า และอื่นๆ</div>
                  </div>
                  <span>→</span>
                </div>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}