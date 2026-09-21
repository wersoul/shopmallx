'use client';
import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

export default function BannersManager({ banners: initial }: { banners: any[] }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const save = async (data: any) => {
    const isNew = !data.id;
    const res = await fetch(isNew ? '/api/admin/banners' : `/api/admin/banners/${data.id}`, {
      method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    const r = await res.json() as any;
    if (r.success) {
      setEditing(null); setCreating(false);
      if (isNew) setItems([...items, r.banner]); else setItems(items.map(i => i.id === r.banner.id ? r.banner : i));
    }
  };

  const del = async (id: string) => {
    if (!confirm('ลบ Banner?')) return;
    await fetch(`/api/admin/banners/${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  };

  const empty = { title: '', subtitle: '', image: '', link: '', position: 'hero', sortOrder: 0, isActive: true };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-card p-4 mb-3 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">🖼 จัดการ Banner</h1><p className="text-sm text-gray-500">{items.length} รายการ</p></div>
        <button onClick={() => setCreating(true)} className="bg-brand-600 text-white px-4 py-2 rounded flex items-center gap-1 text-sm"><FiPlus /> เพิ่ม Banner</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(b => (
          <div key={b.id} className="bg-white rounded-lg shadow-card overflow-hidden">
            <div className="aspect-video bg-gray-100 relative">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              {!b.isActive && <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white">ปิดใช้งาน</div>}
            </div>
            <div className="p-3">
              <div className="font-bold">{b.title}</div>
              <div className="text-sm text-gray-500">{b.subtitle}</div>
              <div className="text-xs text-gray-400 mt-1">ตำแหน่ง: {b.position} | ลำดับ: {b.sortOrder}</div>
              <div className="mt-2 flex gap-2">
                <button onClick={() => setEditing(b)} className="text-sm text-blue-600 hover:bg-blue-50 px-2 py-1 rounded"><FiEdit2 /></button>
                <button onClick={() => del(b.id)} className="text-sm text-red-600 hover:bg-red-50 px-2 py-1 rounded"><FiTrash2 /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
      {(creating || editing) && <BannerForm item={editing || empty} onSave={save} onClose={() => { setEditing(null); setCreating(false); }} />}
    </div>
  );
}

function BannerForm({ item, onSave, onClose }: any) {
  const [form, setForm] = useState(item);
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
      <div className="bg-white rounded-lg w-full max-w-md p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">{item.id ? 'แก้ไข Banner' : 'เพิ่ม Banner'}</h2>
          <button onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={async e => { e.preventDefault(); setLoading(true); await onSave(form); setLoading(false); }} className="space-y-2 text-sm">
          <input required placeholder="หัวเรื่อง *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input placeholder="คำอธิบาย" value={form.subtitle || ''} onChange={e => setForm({ ...form, subtitle: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input required placeholder="URL รูปภาพ *" value={form.image} onChange={e => setForm({ ...form, image: e.target.value })} className="w-full border rounded px-3 py-2" />
          {form.image && <img src={form.image} alt="" className="w-full aspect-video object-cover rounded" />}
          <input placeholder="ลิงก์ (เช่น /products)" value={form.link || ''} onChange={e => setForm({ ...form, link: e.target.value })} className="w-full border rounded px-3 py-2" />
          <select value={form.position} onChange={e => setForm({ ...form, position: e.target.value })} className="w-full border rounded px-3 py-2">
            <option value="hero">Hero (สไลด์หลัก)</option>
            <option value="sidebar">Sidebar (ด้านข้าง)</option>
            <option value="popup">Popup</option>
          </select>
          <input type="number" placeholder="ลำดับ" value={form.sortOrder || 0} onChange={e => setForm({ ...form, sortOrder: parseInt(e.target.value) || 0 })} className="w-full border rounded px-3 py-2" />
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> เปิดใช้งาน</label>
          <div className="flex gap-2 pt-3 border-t">
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded">ยกเลิก</button>
            <button disabled={loading} className="flex-1 bg-brand-600 text-white py-2 rounded font-semibold">{loading ? '...' : 'บันทึก'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}