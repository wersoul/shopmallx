'use client';
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUploadCloud, FiArrowLeft, FiTrash2 } from 'react-icons/fi';

type Item = { file: File; preview: string; name: string; stock: string };

function nameFromFilename(filename: string): string {
  const base = filename.replace(/\.[a-z0-9]+$/i, '');
  return base.replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim() || filename;
}

export default function BulkProductUploader({ categories }: { categories: any[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [parentId, setParentId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [price, setPrice] = useState('0');
  const [defaultStock, setDefaultStock] = useState('9999');
  const [brand, setBrand] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [items, setItems] = useState<Item[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const memo = useMemo(() => {
    const ps = categories.filter((c: any) => !c.parentId);
    const subs = categories.filter((c: any) => c.parentId === parentId);
    return { parents: ps, subOpts: subs };
  }, [categories, parentId]);
  const parents = memo.parents;
  const subOpts = memo.subOpts;

  const onPick = () => inputRef.current?.click();
  const onFiles = (list: FileList | null) => {
    if (!list) return;
    const arr = Array.from(list).filter((f) => f.type.startsWith('image/'));
    if (!arr.length) return alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
    const newItems: Item[] = arr.map((f) => ({
      file: f,
      preview: '',
      name: nameFromFilename(f.name),
      stock: defaultStock || '9999'
    }));
    setItems((prev) => [...prev, ...newItems]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const url = String(e?.target?.result || '');
        setItems((prev) => prev.map((it) => (it.file === f && !it.preview ? { ...it, preview: url } : it)));
      };
      reader.readAsDataURL(f);
    });
  };
  const removeAt = (i: number) => setItems((prev) => prev.filter((_, idx) => idx !== i));
  const updateItem = (i: number, patch: Partial<Item>) =>
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)));
  const clearAll = () => setItems([]);
  const applyStockToAll = () =>
    setItems((prev) => prev.map((it) => ({ ...it, stock: defaultStock || '9999' })));

  const submit = async () => {
    if (!parentId) return alert('กรุณาเลือกหมวดหมู่หลัก');
    if (!items.length) return alert('กรุณาเลือกรูปอย่างน้อย 1 ภาพ');
    setSubmitting(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('categoryId', parentId);
      if (subCategoryId) fd.append('subCategoryId', subCategoryId);
      fd.append('price', price || '0');
      if (brand) fd.append('brand', brand);
      fd.append('isFeatured', isFeatured ? '1' : '0');
      items.forEach((it, i) => {
        fd.append('files', it.file);
        fd.append(`name_${i}`, it.name || nameFromFilename(it.file.name));
        fd.append(`stock_${i}`, String(parseInt(it.stock) || 9999));
      });
      const res = await fetch('/api/admin/products/bulk', { method: 'POST', body: fd });
      const r = await res.json() as any;
      if (!res.ok || !r.success) alert(r.error || 'อัพโหลดไม่สำเร็จ');
      else setResult(r);
    } catch (e: any) {
      alert('อัพโหลดล้มเหลว: ' + (e?.message || e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-card p-4 mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">🖼 เพิ่มสินค้าจำนวนมาก (อัพโหลดรูป)</h1>
          <p className="text-sm text-gray-500">แต่ละรูปจะถูกสร้างเป็นสินค้า 1 รายการ — แก้ไขชื่อ/สต๊อกได้ก่อนสร้าง</p>
        </div>
        <button onClick={() => router.push('/admin/products')} className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded text-sm flex items-center gap-1">
          <FiArrowLeft /> กลับ
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div className="lg:col-span-1 bg-white rounded-lg shadow-card p-4 space-y-3 text-sm">
          <h2 className="font-bold text-brand-600">⚙ ตั้งค่า</h2>
          <div>
            <label className="block mb-1 font-medium">หมวดหมู่หลัก *</label>
            <select required value={parentId} onChange={e => { setParentId(e.target.value); setSubCategoryId(''); }} className="w-full border rounded px-3 py-2">
              <option value="">— เลือก —</option>
              {parents.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">หมวดหมู่ย่อย</label>
            <select disabled={!parentId} value={subCategoryId} onChange={e => setSubCategoryId(e.target.value)} className="w-full border rounded px-3 py-2 disabled:bg-gray-100">
              <option value="">— ไม่มี (ใช้หมวดหลัก) —</option>
              {subOpts.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">ราคา (บาท)</label>
            <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">สต๊อกเริ่มต้น</label>
            <div className="flex gap-1">
              <input type="number" value={defaultStock} onChange={e => setDefaultStock(e.target.value)} className="w-full border rounded px-3 py-2" />
              <button type="button" onClick={applyStockToAll} disabled={!items.length}
                className="text-xs bg-gray-100 hover:bg-gray-200 px-2 rounded disabled:opacity-50 whitespace-nowrap">
                ใช้กับทั้งหมด
              </button>
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">แบรนด์</label>
            <input value={brand} onChange={e => setBrand(e.target.value)} className="w-full border rounded px-3 py-2" />
          </div>
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={isFeatured} onChange={e => setIsFeatured(e.target.checked)} />
            สินค้าแนะนำ
          </label>
          <div className="border-t pt-3 text-xs text-gray-500">
            <p>• แต่ละรูป = 1 สินค้า</p>
            <p>• แก้ไขชื่อ/สต๊อกต่อชิ้นได้ที่ตารางด้านขวา</p>
            <p>• สินค้าจะถูกตั้งเป็น &quot;มาใหม่&quot; อัตโนมัติ</p>
            <p>• ชื่อเริ่มต้นใช้ชื่อไฟล์ (ลบนามสกุล + แทนที่ _/- ด้วยช่องว่าง)</p>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-brand-600">📷 รายการสินค้า ({items.length})</h2>
            <div className="flex gap-2">
              {items.length > 0 && (
                <button onClick={clearAll} className="text-xs text-red-600 hover:bg-red-50 px-2 py-1 rounded">ลบทั้งหมด</button>
              )}
              <button onClick={onPick} className="bg-brand-600 hover:bg-brand-700 text-white px-3 py-1.5 rounded text-sm flex items-center gap-1">
                <FiUploadCloud /> เพิ่มรูป
              </button>
            </div>
          </div>

          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={e => onFiles(e.target.files)}
            className="hidden"
          />

          {!items.length ? (
            <div onClick={onPick} className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition">
              <FiUploadCloud className="text-4xl mx-auto mb-2 text-gray-400" />
              <p className="font-semibold text-gray-700">คลิกเพื่อเลือกรูป หรือลากมาวาง</p>
              <p className="text-xs text-gray-500 mt-1">รองรับ JPG / PNG / WebP — เลือกได้หลายไฟล์พร้อมกัน</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-[60vh] overflow-auto">
              {items.map((it, i) => (
                <div key={i} className="flex gap-3 p-2 border rounded bg-gray-50 hover:bg-gray-100">
                  <div className="w-20 h-20 flex-shrink-0 bg-gray-200 rounded overflow-hidden flex items-center justify-center">
                    {it.preview ? (
                      <img src={it.preview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FiUploadCloud className="text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="bg-brand-600 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0">{i + 1}</span>
                      <input
                        value={it.name}
                        onChange={e => updateItem(i, { name: e.target.value })}
                        placeholder="ชื่อสินค้า"
                        className="flex-1 min-w-0 border rounded px-2 py-1 text-sm"
                      />
                      <input
                        type="number"
                        value={it.stock}
                        onChange={e => updateItem(i, { stock: e.target.value })}
                        placeholder="สต๊อก"
                        className="w-20 border rounded px-2 py-1 text-sm flex-shrink-0"
                        min={0}
                      />
                      <button onClick={() => removeAt(i)} className="text-red-500 hover:bg-red-50 p-1.5 rounded flex-shrink-0" title="ลบ">
                        <FiTrash2 />
                      </button>
                    </div>
                    <div className="text-[11px] text-gray-500 truncate pl-8">{it.file.name}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              พร้อมสร้าง <span className="font-bold text-brand-600">{items.length}</span> สินค้า
            </div>
            <button disabled={submitting || !items.length || !parentId}
              onClick={submit}
              className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded font-semibold disabled:bg-gray-300">
              {submitting ? 'กำลังอัพโหลด...' : `🚀 สร้าง ${items.length} สินค้า`}
            </button>
          </div>

          {result && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded text-sm">
              <div className="font-semibold text-green-800 mb-1">สำเร็จ {result.createdCount} รายการ {result.failedCount > 0 && `/ ล้มเหลว ${result.failedCount}`}</div>
              {result.failed.length > 0 && (
                <details className="text-xs text-red-700">
                  <summary className="cursor-pointer">รายการล้มเหลว</summary>
                  <ul className="list-disc pl-4 mt-1">
                    {result.failed.map((f: any, i: number) => <li key={i}>{f.name}: {f.error}</li>)}
                  </ul>
                </details>
              )}
              <button onClick={() => router.push('/admin/products')} className="mt-2 text-brand-600 underline text-sm">
                ไปหน้าจัดการสินค้า →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}