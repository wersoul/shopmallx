'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) return setErr('รหัสผ่านไม่ตรงกัน');
    if (form.password.length < 8) return setErr('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
    setLoading(true); setErr('');
    const res = await fetch('/api/auth/register', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    const data = await res.json() as any;
    if (!res.ok) {
      setErr(data.error || 'สมัครสมาชิกไม่สำเร็จ');
      setLoading(false);
      return;
    }
    router.push('/');
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto px-3 py-10">
      <div className="bg-white rounded-lg shadow-card p-6">
        <h1 className="text-2xl font-bold mb-1 text-center text-brand-600">สมัครสมาชิก</h1>
        <form onSubmit={submit} className="space-y-3 text-sm">
          <input required placeholder="ชื่อ-นามสกุล *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input required type="email" placeholder="อีเมล *" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input placeholder="เบอร์โทร" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input required type="password" placeholder="รหัสผ่าน (อย่างน้อย 8 ตัว)" value={form.password} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input required type="password" placeholder="ยืนยันรหัสผ่าน" value={form.confirm} onChange={e => setForm({ ...form, confirm: e.target.value })} className="w-full border rounded px-3 py-2" />
          {err && <div className="text-red-600 text-xs">{err}</div>}
          <button disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded">
            {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          มีบัญชีแล้ว? <Link href="/login" className="text-brand-600 hover:underline">เข้าสู่ระบบ</Link>
        </div>
      </div>
    </div>
  );
}