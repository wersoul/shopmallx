'use client';
import { useState } from 'react';

export default function ContactForm() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/contact', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setSent(true);
      setForm({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setSent(false), 3000);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-2 text-sm">
      <input required placeholder="ชื่อ-นามสกุล" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" />
      <input required type="email" placeholder="อีเมล" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded px-3 py-2" />
      <input placeholder="เบอร์โทร" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border rounded px-3 py-2" />
      <textarea required placeholder="ข้อความ" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={4} className="w-full border rounded px-3 py-2" />
      <button className="w-full bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 rounded">
        ส่งข้อความ
      </button>
      {sent && <div className="text-green-600 text-center text-sm">ส่งข้อความเรียบร้อยแล้ว!</div>}
    </form>
  );
}