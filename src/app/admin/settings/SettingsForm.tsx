'use client';
import { useRef, useState } from 'react';
import { FiUploadCloud, FiTrash2 } from 'react-icons/fi';

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

const LOGO_MAX_BYTES = 5 * 1024 * 1024;

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

  // Logo upload state — separate from the generic save because it goes via
  // /api/admin/logo which writes to R2.
  const logoInputRef = useRef<HTMLInputElement>(null);
  const [logoUploading, setLogoUploading] = useState(false);
  const [logoProgress, setLogoProgress] = useState('');
  const [logoError, setLogoError] = useState('');
  const logoUrl: string = (form.logo_url || '').trim();

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

  const onPickLogo = () => logoInputRef.current?.click();

  const onLogoFile = async (file: File | null) => {
    if (!file) return;
    setLogoError('');
    if (!file.type.startsWith('image/')) {
      setLogoError('ต้องเป็นไฟล์รูปภาพเท่านั้น');
      return;
    }
    if (file.size > LOGO_MAX_BYTES) {
      setLogoError('ไฟล์ใหญ่เกิน 5MB');
      return;
    }
    setLogoUploading(true);
    setLogoProgress(`กำลังอัปโหลด ${file.name}...`);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/logo', { method: 'POST', body: fd });
      const r = await res.json() as any;
      if (!res.ok || !r.success) {
        setLogoError(r.error || 'อัปโหลดไม่สำเร็จ');
        return;
      }
      setForm(f => ({ ...f, logo_url: r.url }));
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e: any) {
      setLogoError('อัปโหลดล้มเหลว: ' + (e?.message || 'network error'));
    } finally {
      setLogoUploading(false);
      setLogoProgress('');
      if (logoInputRef.current) logoInputRef.current.value = '';
    }
  };

  const removeLogo = async () => {
    if (!confirm('ลบโลโก้ร้านค้าออกจาก R2 bucket และตั้งค่าเว็บไซต์?')) return;
    setLogoUploading(true);
    setLogoError('');
    try {
      const res = await fetch('/api/admin/logo', { method: 'DELETE' });
      const r = await res.json() as any;
      if (!res.ok || !r.success) {
        setLogoError(r.error || 'ลบไม่สำเร็จ');
        return;
      }
      setForm(f => {
        const { logo_url: _, ...rest } = f;
        return rest;
      });
    } catch (e: any) {
      setLogoError('ลบไม่สำเร็จ: ' + (e?.message || 'network error'));
    } finally {
      setLogoUploading(false);
    }
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
        <h2 className="font-bold mb-3 text-brand-600">🖼 โลโก้ร้านค้า (R2 bucket)</h2>
        <div className="flex flex-col md:flex-row gap-4 items-start">
          <div className="w-40 h-40 rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden shrink-0">
            {logoUrl ? (
              <img src={logoUrl} alt="logo" className="w-full h-full object-contain" />
            ) : (
              <div className="text-center text-gray-400 text-xs px-2">ยังไม่มีโลโก้<br/>แนะนำ PNG/SVG ใส</div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                disabled={logoUploading}
                onClick={onPickLogo}
                className="flex items-center gap-1 px-3 py-2 border-2 border-dashed border-brand-400 text-brand-600 rounded hover:bg-brand-50 text-sm disabled:opacity-50"
              >
                <FiUploadCloud /> {logoUploading ? (logoProgress || 'กำลังอัปโหลด...') : (logoUrl ? 'เปลี่ยนโลโก้' : 'อัปโหลดโลโก้')}
              </button>
              {logoUrl && (
                <button
                  type="button"
                  disabled={logoUploading}
                  onClick={removeLogo}
                  className="flex items-center gap-1 px-3 py-2 border border-red-300 text-red-600 rounded hover:bg-red-50 text-sm disabled:opacity-50"
                >
                  <FiTrash2 /> ลบโลโก้
                </button>
              )}
            </div>
            {logoUrl && (
              <div className="text-xs text-gray-500 break-all mb-1">
                URL: <a href={logoUrl} target="_blank" rel="noreferrer" className="text-brand-600 underline">{logoUrl}</a>
              </div>
            )}
            {logoError && <div className="text-xs text-red-600 mb-1">{logoError}</div>}
            <p className="text-xs text-gray-500">รองรับไฟล์รูปภาพ (jpg/png/webp/svg/avif) ขนาดไม่เกิน 5MB จะถูกเก็บใน R2 folder <code>branding/</code> และใช้แสดงบนหน้าเว็บทันที</p>
          </div>
        </div>
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

      <input
        ref={logoInputRef}
        type="file"
        accept="image/*"
        onChange={e => onLogoFile(e.target.files?.[0] || null)}
        className="hidden"
      />
    </form>
  );
}