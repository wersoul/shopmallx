'use client';
import { useState } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';

export default function PromotionsManager({ promotions: initial }: { promotions: any[] }) {
  const [items, setItems] = useState(initial);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const save = async (data: any) => {
    const isNew = !data.id;
    const res = await fetch(isNew ? '/api/admin/promotions' : `/api/admin/promotions/${data.id}`, {
      method: isNew ? 'POST' : 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    const r = await res.json();
    if (r.success) {
      setEditing(null); setCreating(false);
      if (isNew) setItems([...items, r.promotion]); else setItems(items.map(i => i.id === r.promotion.id ? r.promotion : i));
    }
  };

  const del = async (id: string) => {
    if (!confirm('ลบโปรโมชั่น?')) return;
    await fetch(`/api/admin/promotions/${id}`, { method: 'DELETE' });
    setItems(items.filter(i => i.id !== id));
  };

  const empty = { title: '', description: '', badge: '', image: '', link: '', sortOrder: 0, isActive: true };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-card p-4 mb-3 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">🎁 จัดการโปรโมชั่น</h1><p className="text-sm text-gray-500">{items.length} รายการ</p></div>
        <button onClick={() => setCreating(true)} className="bg-brand-600 text-white px-4 py-2 rounded flex items-center gap-1 text-sm"><FiPlus /> เพิ่ม</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {items.map(p => (
          <div key={p.id} className="bg-gradient-to-br from-brand-500 to-brand-700 text-white rounded-lg p-4 flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center font-extrabold shrink-0">{p.badge}</div>
            <div className="flex-1 min-w-0">
              <div className="font-bold">{p.title}</div>
              <div className="text-sm opacity-90">{p.description}</div>
            </div>
            <div>
              <button onClick={() => setEditing(p)} className="text-white/80 hover:bg-white/20 p-1 rounded"><FiEdit2 /></button>
              <button onClick={() => del(p.id)} className="text-white/80 hover:bg-white/20 p-1 rounded"><FiTrash2 /></button>
            </div>
          </div>
        ))}
      </div>
      {(creating || editing) && <PromoForm item={editing || empty} onSave={save} onClose={() => { setEditing(null); setCreating(false); }} />}
    </div>
  );
}

function PromoForm({ item, onSave, onClose }: any) {
  const [form, setForm] = useState(item);
  const [loading, setLoading] = useState(false);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
      <div className="bg-white rounded-lg w-full max-w-md p-5">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">{item.id ? 'แก้ไขโปรโมชั่น' : 'เพิ่มโปรโมชั่น'}</h2>
          <button onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={async e => { e.preventDefault(); setLoading(true); await onSave(form); setLoading(false); }} className="space-y-2 text-sm">
          <input required placeholder="หัวเรื่อง *" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input placeholder="คำอธิบาย" value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input required placeholder="Badge (เช่น FREE, -10%) *" value={form.badge} onChange={e => setForm({ ...form, badge: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input placeholder="ลิงก์" value={form.link || ''} onChange={e => setForm({ ...form, link: e.target.value })} className="w-full border rounded px-3 py-2" />
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