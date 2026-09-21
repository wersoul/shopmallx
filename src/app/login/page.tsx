'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    const res = await fetch('/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || 'เข้าสู่ระบบไม่สำเร็จ');
      setLoading(false);
      return;
    }
    router.push(params.get('redirect') || (data.user.role === 'admin' ? '/admin' : '/'));
    router.refresh();
  };

  return (
    <div className="max-w-md mx-auto px-3 py-10">
      <div className="bg-white rounded-lg shadow-card p-6">
        <h1 className="text-2xl font-bold mb-1 text-center text-brand-600">เข้าสู่ระบบ</h1>
        <p className="text-center text-sm text-gray-500 mb-6">SHOPMALLX</p>
        <form onSubmit={submit} className="space-y-3 text-sm">
          <input required type="email" placeholder="อีเมล" value={email} onChange={e => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
          <input required type="password" placeholder="รหัสผ่าน" value={password} onChange={e => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
          {err && <div className="text-red-600 text-xs">{err}</div>}
          <button disabled={loading} className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold py-2.5 rounded">
            {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
          </button>
        </form>
        <div className="mt-4 text-center text-sm">
          ยังไม่มีบัญชี? <Link href="/register" className="text-brand-600 hover:underline">สมัครสมาชิก</Link>
        </div>
        <div className="mt-4 p-3 bg-gray-50 rounded text-xs text-gray-500">
          <div className="font-semibold mb-1">ทดสอบ:</div>
          <div>Admin: admin@shopmallx.com / admin1234</div>
          <div>ลูกค้า: demo@shopmallx.com / 12345678</div>
        </div>
      </div>
    </div>
  );
}