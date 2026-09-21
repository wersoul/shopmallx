'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import ImageUploader from '@/components/ImageUploader';

export default function CategoriesManager({ categories: initial }: { categories: any[] }) {
  const router = useRouter();
  const [cats, setCats] = useState(initial);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  const save = async (data: any) => {
    const isNew = !data.id;
    const res = await fetch(isNew ? '/api/admin/categories' : `/api/admin/categories/${data.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const r = await res.json() as any;
    if (r.success) {
      setEditing(null); setCreating(false);
      if (isNew) setCats([...cats, r.category]);
      else setCats(cats.map(c => c.id === r.category.id ? r.category : c));
      router.refresh();
    } else alert(r.error);
  };

  const del = async (id: string) => {
    if (!confirm('ลบหมวดหมู่นี้?')) return;
    const res = await fetch(`/api/admin/categories/${id}`, { method: 'DELETE' });
    if (res.ok) { setCats(cats.filter(c => c.id !== id)); router.refresh(); }
  };

  const empty = { name: '', slug: '', description: '', parentId: '', image: '', sortOrder: 0, isActive: true };

  // Exclude self + descendants from parent picker so we can't create cycles.
  const parentOptions = (current: any) => {
    if (!current?.id) return cats.filter(c => !c.parentId);
    const descendants = new Set<string>([current.id]);
    let added = true;
    while (added) {
      added = false;
      for (const c of cats) {
        if (c.parentId && descendants.has(c.parentId) && !descendants.has(c.id)) {
          descendants.add(c.id);
          added = true;
        }
      }
    }
    return cats.filter(c => !c.parentId && !descendants.has(c.id));
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-card p-4 mb-3 flex items-center justify-between">
        <div><h1 className="text-2xl font-bold">📁 จัดการหมวดหมู่</h1><p className="text-sm text-gray-500">{cats.length} หมวด</p></div>
        <button onClick={() => setCreating(true)} className="bg-brand-600 text-white px-4 py-2 rounded flex items-center gap-1 text-sm"><FiPlus /> เพิ่มหมวด</button>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">ชื่อ</th>
              <th className="text-left px-3 py-2">Slug</th>
              <th className="text-center px-3 py-2">รูป</th>
              <th className="text-left px-3 py-2">หมวดแม่</th>
              <th className="text-center px-3 py-2">ลำดับ</th>
              <th className="text-center px-3 py-2">สถานะ</th>
              <th className="text-center px-3 py-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {cats.map(c => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{c.parentId ? '└ ' : ''}{c.name}</td>
                <td className="px-3 py-2 font-mono text-xs">{c.slug}</td>
                <td className="px-3 py-2 text-center">
                  {c.image ? <img src={c.image} alt="" className="w-10 h-10 object-cover rounded inline-block" /> : <span className="text-gray-300">-</span>}
                </td>
                <td className="px-3 py-2 text-gray-500">{cats.find(p => p.id === c.parentId)?.name || '-'}</td>
                <td className="px-3 py-2 text-center">{c.sortOrder}</td>
                <td className="px-3 py-2 text-center"><span className={`px-2 py-0.5 rounded-full text-xs ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{c.isActive ? 'เปิด' : 'ปิด'}</span></td>
                <td className="px-3 py-2 text-center">
                  <button onClick={() => setEditing(c)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><FiEdit2 /></button>
                  <button onClick={() => del(c.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <CatForm
          cat={editing || empty}
          parentOptions={parentOptions(editing)}
          onSave={save}
          onClose={() => { setEditing(null); setCreating(false); }}
        />
      )}
    </div>
  );
}

function CatForm({ cat, parentOptions, onSave, onClose }: any) {
  const [form, setForm] = useState({ ...cat, images: cat.image ? [cat.image] : [] });
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
      <div className="bg-white rounded-lg w-full max-w-md p-5 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">{cat.id ? 'แก้ไขหมวด' : 'เพิ่มหมวดใหม่'}</h2>
          <button onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={async e => {
          e.preventDefault();
          setLoading(true);
          // collapse the image list back to a single image string for the API
          await onSave({ ...form, image: (form.images && form.images[0]) || '' });
          setLoading(false);
        }} className="space-y-2 text-sm">
          <input required placeholder="ชื่อหมวด *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" />
          <input placeholder="Slug" value={form.slug || ''} onChange={e => setForm({ ...form, slug: e.target.value })} className="w-full border rounded px-3 py-2" />
          <textarea placeholder="คำอธิบาย" rows={2} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2" />
          <select value={form.parentId || ''} onChange={e => setForm({ ...form, parentId: e.target.value })} className="w-full border rounded px-3 py-2">
            <option value="">- ไม่มีหมวดแม่ -</option>
            {parentOptions.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
          <div>
            <label className="block mb-1 font-medium">รูปหมวดหมู่</label>
            <ImageUploader
              value={form.images}
              onChange={(urls) => setForm({ ...form, images: urls })}
              folder="categories"
              multiple={false}
            />
          </div>
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