'use client';
import { useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiUploadCloud, FiArrowLeft, FiTrash2 } from 'react-icons/fi';

export default function BulkProductUploader({ categories }: { categories: any[] }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [parentId, setParentId] = useState('');
  const [subCategoryId, setSubCategoryId] = useState('');
  const [price, setPrice] = useState('0');
  const [stock, setStock] = useState('9999');
  const [brand, setBrand] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  const memo = useMemo(() => {
    const ps = categories.filter((c: any) => !c.parentId);
    const subs = categories.filter((c: any) => c.parentId === parentId);
    return { parents: ps, subOpts: subs };
  }, [categories, parentId]);
  const parents = memo.parents;
  const subOpts = memo.subOpts;

  const onPick = () => inputRef.current?.click();
  const onFiles = (list) => {
    if (!list) return;
    const arr = Array.from(list as FileList).filter((f) => (f as File).type.startsWith('image/'));
    if (!arr.length) return alert('กรุณาเลือกไฟล์รูปภาพเท่านั้น');
    setFiles((prev) => [...prev, ...arr]);
    arr.forEach((f) => {
      const reader = new FileReader();
      reader.onload = (e: any) => setPreviews((prev) => [...prev, String(e?.target?.result || '')]);
      reader.readAsDataURL(f);
    });
  };
  const removeAt = (i) => {
    setFiles((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };
  const clearAll = () => { setFiles([]); setPreviews([]); };

  const submit = async () => {
    if (!parentId) return alert('กรุณาเลือกหมวดหมู่หลัก');
    if (!files.length) return alert('กรุณาเลือกรูปอย่างน้อย 1 รูป');
    setSubmitting(true);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append('categoryId', parentId);
      if (subCategoryId) fd.append('subCategoryId', subCategoryId);
      fd.append('price', price || '0');
      fd.append('stock', stock || '9999');
      if (brand) fd.append('brand', brand);
      fd.append('isFeatured', isFeatured ? '1' : '0');
      files.forEach((f) => fd.append('files', f));
      const res = await fetch('/api/admin/products/bulk', { method: 'POST', body: fd });
      const r = await res.json() as any;
      if (!res.ok || !r.success) alert(r.error || 'อัพโหลดไม่สำเร็จ');
      else setResult(r);
    } catch (e) {
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
          <p className="text-sm text-gray-500">แต่ละรูปจะถูกสร้างเป็นสินค้า 1 รายการ ใช้ชื่อไฟล์เป็นชื่อสินค้า</p>
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
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 font-medium">ราคา</label>
              <input type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1 font-medium">สต๊อก</label>
              <input type="number" value={stock} onChange={e => setStock(e.target.value)} className="w-full border rounded px-3 py-2" />
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
            <p>• สต๊อกเริ่มต้น = 9999</p>
            <p>• สินค้าจะถูกตั้งเป็น &quot;มาใหม่&quot; อัตโนมัติ</p>
            <p>• ชื่อสินค้าจะใช้ชื่อไฟล์ (ลบนามสกุล + แทนที่ _/- ด้วยช่องว่าง)</p>
          </div>
        </div>
<div className="lg:col-span-2 bg-white rounded-lg shadow-card p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-bold text-brand-600">📷 รูปภาพ ({files.length})</h2>
            <div className="flex gap-2">
              {files.length > 0 && (
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

          {!files.length ? (
            <div onClick={onPick} className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center cursor-pointer hover:border-brand-400 hover:bg-brand-50 transition">
              <FiUploadCloud className="text-4xl mx-auto mb-2 text-gray-400" />
              <p className="font-semibold text-gray-700">คลิกเพื่อเลือกรูป หรือลากมาวาง</p>
              <p className="text-xs text-gray-500 mt-1">รองรับ JPG / PNG / WebP — เลือกได้หลายไฟล์พร้อมกัน</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 max-h-96 overflow-auto">
              {previews.map((p: string, i: number) => (
                <div key={i} className="relative group">
                  <img src={p} alt="" className="w-full aspect-square object-cover rounded border" />
                  <button onClick={() => removeAt(i)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100">
                    <FiTrash2 size={10} />
                  </button>
                  <div className="absolute bottom-1 left-1 right-1 bg-black/60 text-white text-[10px] px-1 py-0.5 rounded truncate">
                    {files[i].name}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="mt-4 pt-4 border-t flex items-center justify-between">
            <div className="text-sm text-gray-600">
              พร้อมสร้าง <span className="font-bold text-brand-600">{files.length}</span> สินค้า
            </div>
            <button disabled={submitting || !files.length || !parentId}
              onClick={submit}
              className="bg-brand-600 hover:bg-brand-700 text-white px-5 py-2 rounded font-semibold disabled:bg-gray-300">
              {submitting ? 'กำลังอัพโหลด...' : `🚀 สร้าง ${files.length} สินค้า`}
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