'use client';
import { useState } from 'react';

const groups = [
  { title: 'ข้อมูลทั่วไป', keys: ['site_name', 'site_tagline', 'logo_text'] },
  { title: 'การติดต่อ', keys: ['phone', 'email', 'address', 'line_id', 'facebook', 'youtube'] },
  { title: 'การเงิน/การจัดส่ง', keys: ['bank_name', 'bank_account', 'bank_holder', 'shipping_fee', 'free_shipping_min'] }
];

const labels: any = {
  site_name: 'ชื่อเว็บไซต์', site_tagline: 'คำอธิบาย', logo_text: 'ข้อความโลโก้',
  phone: 'เบอร์โทร', email: 'อีเมล', address: 'ที่อยู่', line_id: 'Line ID', facebook: 'Facebook URL', youtube: 'YouTube URL',
  bank_name: 'ชื่อธนาคาร', bank_account: 'เลขที่บัญชี', bank_holder: 'ชื่อบัญชี', shipping_fee: 'ค่าจัดส่ง (บาท)', free_shipping_min: 'ส่งฟรีเมื่อซื้อครบ (บาท)'
};

const COLOR_PRESETS = [
  '#ff2d2d', // red (default)
  '#ed1515', // crimson
  '#f97316', // orange
  '#eab308', // yellow
  '#16a34a', // green
  '#0ea5e9', // sky
  '#2563eb', // blue
  '#7c3aed', // violet
  '#db2777', // pink
  '#1f2937'  // slate
];

export default function SettingsForm({ settings }: { settings: any[] }) {
  const initial: any = {};
  settings.forEach(s => initial[s.key] = s.value);
  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true); setSaved(false);
    const res = await fetch('/api/admin/settings', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
    });
    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    }
    setSaving(false);
  };

  return (
    <form onSubmit={save}>
      <div className="bg-white rounded-lg shadow-card p-4 mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">⚙ ตั้งค่าเว็บไซต์</h1>
          <p className="text-sm text-gray-500">แก้ไขข้อมูลทั่วไป การติดต่อ บัญชีธนาคาร ค่าจัดส่ง สีธีม</p>
        </div>
        <button disabled={saving} className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded font-semibold">
          {saving ? 'กำลังบันทึก...' : saved ? '✓ บันทึกแล้ว' : 'บันทึกทั้งหมด'}
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-card p-4 mb-3">
        <h2 className="font-bold mb-3 text-brand-600">🎨 สีธีมเว็บไซต์</h2>
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={form.primary_color || '#ff2d2d'}
              onChange={e => setForm({ ...form, primary_color: e.target.value })}
              className="w-14 h-14 rounded cursor-pointer border"
            />
            <input
              type="text"
              value={form.primary_color || ''}
              onChange={e => setForm({ ...form, primary_color: e.target.value })}
              placeholder="#ff2d2d"
              className="border rounded px-3 py-2 font-mono w-32"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {COLOR_PRESETS.map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setForm({ ...form, primary_color: c })}
                className={`w-8 h-8 rounded-full border-2 ${form.primary_color === c ? 'border-black scale-110' : 'border-white shadow'}`}
                style={{ background: c }}
                title={c}
              />
            ))}
          </div>
          <div className="flex gap-2 ml-auto">
            <button type="button" onClick={() => setForm({ ...form, primary_color: '#ff2d2d' })} className="px-3 py-2 text-xs border rounded">รีเซ็ต</button>
            <div className="w-12 h-12 rounded shadow" style={{ background: form.primary_color || '#ff2d2d' }} />
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2">สีนี้จะถูกใช้กับปุ่ม ลิงก์ หัวข้อ ไอคอน และองค์ประกอบหลักทั้งหมดของเว็บไซต์</p>
      </div>

      {groups.map(g => (
        <div key={g.title} className="bg-white rounded-lg shadow-card p-4 mb-3">
          <h2 className="font-bold mb-3 text-brand-600">{g.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {g.keys.map(k => (
              <div key={k}>
                <label className="block mb-1 text-gray-700 font-medium">{labels[k] || k}</label>
                <input value={form[k] || ''} onChange={e => setForm({ ...form, [k]: e.target.value })}
                  className="w-full border rounded px-3 py-2" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </form>
  );
}