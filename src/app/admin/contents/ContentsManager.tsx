'use client';
import { useState } from 'react';
import { FiEdit2 } from 'react-icons/fi';

export default function ContentsManager({ contents }: { contents: any[] }) {
  const [editing, setEditing] = useState<any>(null);
  const [list, setList] = useState(contents);

  const keys = ['about', 'howto', 'contact', 'policy'];
  const labels: any = { about: 'เกี่ยวกับเรา', howto: 'วิธีการสั่งซื้อ', contact: 'ติดต่อเรา', policy: 'นโยบายการคืนสินค้า' };

  const save = async (data: any) => {
    const res = await fetch('/api/admin/contents', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data)
    });
    const r = await res.json();
    if (r.success) {
      setEditing(null);
      setList(list.map(c => c.key === r.content.key ? r.content : c).concat(list.find(c => c.key === r.content.key) ? [] : [r.content]));
    }
  };

  return (
    <div>
      <div className="bg-white rounded-lg shadow-card p-4 mb-3">
        <h1 className="text-2xl font-bold">📄 จัดการเนื้อหา</h1>
        <p className="text-sm text-gray-500">แก้ไขหน้า About, วิธีการสั่งซื้อ, ติดต่อเรา, นโยบาย</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {keys.map(k => {
          const c = list.find(x => x.key === k);
          return (
            <div key={k} className="bg-white rounded-lg shadow-card p-4">
              <h3 className="font-bold">{labels[k]}</h3>
              <p className="text-xs text-gray-500 mb-2">Key: {k}</p>
              <p className="text-sm text-gray-700 line-clamp-3 mb-3">{c?.body || 'ยังไม่มีเนื้อหา'}</p>
              <button onClick={() => setEditing(c || { key: k, title: labels[k], body: '' })} className="text-sm bg-brand-600 text-white px-3 py-1 rounded flex items-center gap-1">
                <FiEdit2 /> แก้ไข
              </button>
            </div>
          );
        })}
      </div>
      {editing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
          <div className="bg-white rounded-lg w-full max-w-2xl p-5 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">แก้ไขเนื้อหา: {labels[editing.key]}</h2>
              <button onClick={() => setEditing(null)}>✕</button>
            </div>
            <form onSubmit={async e => { e.preventDefault(); await save(editing); }} className="space-y-2 text-sm">
              <input required placeholder="หัวเรื่อง" value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} className="w-full border rounded px-3 py-2" />
              <textarea required rows={12} placeholder="เนื้อหา" value={editing.body} onChange={e => setEditing({ ...editing, body: e.target.value })} className="w-full border rounded px-3 py-2 font-mono text-xs" />
              <div className="flex gap-2 pt-3 border-t">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 border py-2 rounded">ยกเลิก</button>
                <button className="flex-1 bg-brand-600 text-white py-2 rounded font-semibold">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}