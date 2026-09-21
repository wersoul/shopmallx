'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiX } from 'react-icons/fi';
import { priceFormat } from '@/lib/settings';
import ImageUploader from '@/components/ImageUploader';

export default function ProductsManager({ products: initialProducts, categories }: { products: any[]; categories: any[] }) {
  const router = useRouter();
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);

  // Derive parent + child category lists so the form can present two dropdowns.
  const { parents, childrenByParent } = useMemo(() => {
    const ps = categories.filter((c: any) => !c.parentId);
    const map: Record<string, any[]> = {};
    for (const c of categories) {
      if (c.parentId) {
        if (!map[c.parentId]) map[c.parentId] = [];
        map[c.parentId].push(c);
      }
    }
    return { parents: ps, childrenByParent: map };
  }, [categories]);

  const save = async (data: any) => {
    const isNew = !data.id;
    const url = isNew ? '/api/admin/products' : `/api/admin/products/${data.id}`;
    const method = isNew ? 'POST' : 'PUT';
    const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
    const r = await res.json() as any;
    if (r.success) {
      setEditing(null); setCreating(false);
      if (isNew) setProducts([r.product, ...products]);
      else setProducts(products.map(p => p.id === r.product.id ? r.product : p));
      router.refresh();
    } else alert(r.error);
  };

  const del = async (id: string) => {
    if (!confirm('ลบสินค้านี้?')) return;
    const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
    if (res.ok) { setProducts(products.filter(p => p.id !== id)); router.refresh(); }
  };

  const empty = {
    name: '', slug: '', description: '',
    price: 0, salePrice: '', stock: 0, brand: '',
    images: [],
    parentId: parents[0]?.id || '',
    categoryId: parents[0]?.id || '',
    subCategoryId: '',
    isActive: true, isFeatured: false, isNew: false
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-card p-4 mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">📦 จัดการสินค้า</h1>
          <p className="text-sm text-gray-500">{products.length} รายการ</p>
        </div>
        <button onClick={() => setCreating(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded flex items-center gap-1 text-sm">
          <FiPlus /> เพิ่มสินค้า
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">สินค้า</th>
              <th className="text-left px-3 py-2">หมวด</th>
              <th className="text-right px-3 py-2">ราคา</th>
              <th className="text-center px-3 py-2">สต๊อก</th>
              <th className="text-center px-3 py-2">สถานะ</th>
              <th className="text-center px-3 py-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => {
              const imgs = typeof p.images === 'string' ? JSON.parse(p.images || '[]') : (p.images || []);
              return (
                <tr key={p.id} className="border-t hover:bg-gray-50">
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <img src={imgs[0] || 'https://via.placeholder.com/40'} alt="" className="w-10 h-10 rounded object-cover" />
                      <div className="min-w-0">
                        <div className="font-medium line-clamp-1">{p.name}</div>
                        <div className="text-xs text-gray-500">{p.brand}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-sm">{p.categoryName || '-'}</div>
                    {p.subCategoryName && <div className="text-xs text-gray-500">└ {p.subCategoryName}</div>}
                  </td>
                  <td className="px-3 py-2 text-right">
                    {p.salePrice ? <><div className="text-brand-600 font-bold">฿{priceFormat(p.salePrice)}</div><div className="text-xs text-gray-400 line-through">฿{priceFormat(p.price)}</div></> : <div>฿{priceFormat(p.price)}</div>}
                  </td>
                  <td className="px-3 py-2 text-center">{p.stock}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${p.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>{p.isActive ? 'เปิด' : 'ปิด'}</span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button onClick={() => setEditing(p)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded inline-block"><FiEdit2 /></button>
                    <button onClick={() => del(p.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded inline-block"><FiTrash2 /></button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <ProductForm
          product={editing || empty}
          parents={parents}
          childrenByParent={childrenByParent}
          onSave={save}
          onClose={() => { setEditing(null); setCreating(false); }}
        />
      )}
    </div>
  );
}

function ProductForm({ product, parents, childrenByParent, onSave, onClose }: any) {
  // Resolve parent from an existing subcategoryId if editing.
  const initialParent = product.parentId || (() => {
    if (product.subCategoryId) {
      const entry = Object.entries(childrenByParent).find(([, kids]) =>
        (kids as any[]).some((k: any) => k.id === product.subCategoryId)
      );
      return entry ? entry[0] : '';
    }
    return product.categoryId || '';
  })();

  const [form, setForm] = useState({
    ...product,
    parentId: initialParent,
    subCategoryId: product.subCategoryId || '',
    categoryId: product.subCategoryId || product.categoryId || '',
    images: typeof product.images === 'string' ? JSON.parse(product.images || '[]') : (product.images || [])
  });
  const [loading, setLoading] = useState(false);

  const subOpts: any[] = childrenByParent[form.parentId] || [];

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Final categoryId = subcategory if chosen, otherwise parent.
    const payload: any = { ...form, categoryId: form.subCategoryId || form.parentId };
    delete payload.parentId;
    await onSave(payload);
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3 overflow-auto">
      <div className="bg-white rounded-lg w-full max-w-2xl p-5 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold text-lg">{product.id ? 'แก้ไขสินค้า' : 'เพิ่มสินค้าใหม่'}</h2>
          <button onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={submit} className="space-y-3 text-sm">
          <div>
            <label className="block mb-1 font-semibold">ชื่อสินค้า *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-semibold">หมวดหมู่หลัก *</label>
              <select required value={form.parentId} onChange={e => setForm({ ...form, parentId: e.target.value, subCategoryId: '' })} className="w-full border rounded px-3 py-2">
                <option value="">— เลือก —</option>
                {parents.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block mb-1 font-semibold">หมวดหมู่ย่อย</label>
              <select disabled={!form.parentId} value={form.subCategoryId} onChange={e => setForm({ ...form, subCategoryId: e.target.value })} className="w-full border rounded px-3 py-2 disabled:bg-gray-100">
                <option value="">— ไม่มี (ใช้หมวดหลัก) —</option>
                {subOpts.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block mb-1 font-semibold">ราคา *</label>
              <input required type="number" step="0.01" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
            <div><label className="block mb-1 font-semibold">ราคาลด</label>
              <input type="number" step="0.01" value={form.salePrice || ''} onChange={e => setForm({ ...form, salePrice: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
            <div><label className="block mb-1 font-semibold">สต๊อก</label>
              <input type="number" value={form.stock} onChange={e => setForm({ ...form, stock: parseInt(e.target.value) || 0 })} className="w-full border rounded px-3 py-2" /></div>
            <div><label className="block mb-1 font-semibold">แบรนด์</label>
              <input value={form.brand || ''} onChange={e => setForm({ ...form, brand: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
          </div>
          <div><label className="block mb-1 font-semibold">รายละเอียด</label>
            <textarea rows={3} value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} className="w-full border rounded px-3 py-2" /></div>
          <div>
            <label className="block mb-1 font-semibold">รูปภาพ</label>
            <ImageUploader
              value={form.images}
              onChange={(urls) => setForm({ ...form, images: urls })}
              folder="products"
              multiple
            />
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={e => setForm({ ...form, isActive: e.target.checked })} /> เปิดขาย</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} /> สินค้าแนะนำ</label>
            <label className="flex items-center gap-2"><input type="checkbox" checked={form.isNew} onChange={e => setForm({ ...form, isNew: e.target.checked })} /> สินค้ามาใหม่</label>
          </div>
          <div className="flex gap-2 pt-3 border-t">
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded">ยกเลิก</button>
            <button disabled={loading} className="flex-1 bg-brand-600 hover:bg-brand-700 text-white py-2 rounded font-semibold">{loading ? 'กำลังบันทึก...' : 'บันทึก'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}