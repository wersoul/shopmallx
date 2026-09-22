'use client';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiSearch } from 'react-icons/fi';
import { formatDateTime } from '@/lib/settings';

export default function CustomersManager({ users: initial, orderCounts }: { users: any[]; orderCounts: Record<string, number> }) {
  const router = useRouter();
  const [users, setUsers] = useState(initial);
  const [editing, setEditing] = useState<any>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');

  const save = async (data: any) => {
    const isNew = !data.id;
    const res = await fetch(isNew ? '/api/admin/users' : `/api/admin/users/${data.id}`, {
      method: isNew ? 'POST' : 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const r = await res.json() as any;
    if (r.success) {
      setEditing(null); setCreating(false);
      if (isNew) setUsers([r.user, ...users.filter((u: any) => u.id !== r.user.id)]);
      else setUsers(users.map((u: any) => u.id === r.user.id ? r.user : u));
      router.refresh();
    } else alert(r.error);
  };

  const del = async (id: string) => {
    if (!confirm('ลบลูกค้านี้?')) return;
    const res = await fetch(`/api/admin/users/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setUsers(users.filter((u: any) => u.id !== id));
      router.refresh();
    }
  };

  const empty = { email: '', name: '', phone: '', role: 'customer', address: '', province: '', postalCode: '', password: '' };

  // Filter the user list by free-text query. Matches against name, email and
  // phone (the most common search fields for a customer table). Search is
  // case-insensitive and ignores whitespace around the term.
  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u: any) => {
      const hay = [
        u.name,
        u.email,
        u.phone || ''
      ].map(v => String(v).toLowerCase());
      return hay.some(h => h.includes(q));
    });
  }, [users, query]);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-card p-4 mb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">👥 จัดการลูกค้า</h1>
          <p className="text-sm text-gray-500">
            สมาชิก {users.filter((u: any) => u.role === 'customer').length} คน | แอดมิน {users.filter((u: any) => u.role === 'admin').length} คน
            {query.trim() && <> | ค้นพบ {filteredUsers.length} รายการ</>}
          </p>
        </div>
        <button onClick={() => setCreating(true)} className="bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded flex items-center gap-1 text-sm">
          <FiPlus /> เพิ่มลูกค้า
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-card p-3 mb-3 flex items-center gap-2">
        <div className="relative flex-1 max-w-md">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="ค้นหาชื่อ / อีเมล / เบอร์โทร..."
            className="w-full border rounded pl-9 pr-3 py-2 text-sm focus:border-brand-500 focus:outline-none"
          />
        </div>
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-sm text-gray-500 hover:text-brand-600 px-2 py-1"
          >
            ล้างคำค้น
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">ชื่อ</th>
              <th className="text-left px-3 py-2">อีเมล</th>
              <th className="text-left px-3 py-2">โทร</th>
              <th className="text-center px-3 py-2">ระดับ</th>
              <th className="text-center px-3 py-2">คำสั่งซื้อ</th>
              <th className="text-center px-3 py-2">สมัครเมื่อ</th>
              <th className="text-center px-3 py-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-3 py-8 text-center text-gray-400 text-sm">
                  {query.trim() ? `ไม่พบลูกค้าที่ตรงกับ "${query.trim()}"` : 'ยังไม่มีลูกค้าในระบบ'}
                </td>
              </tr>
            ) : filteredUsers.map((u: any) => (
              <tr key={u.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">{u.name}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.phone || '-'}</td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-0.5 rounded-full text-xs ${u.role === 'admin' ? 'bg-brand-100 text-brand-700' : 'bg-gray-100 text-gray-700'}`}>
                    {u.role === 'admin' ? 'แอดมิน' : 'ลูกค้า'}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">{orderCounts[u.id] || 0}</td>
                <td className="px-3 py-2 text-center text-xs whitespace-nowrap">{formatDateTime(u.createdAt)}</td>
                <td className="px-3 py-2 text-center">
                  <button onClick={() => setEditing(u)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded inline-block"><FiEdit2 /></button>
                  <button onClick={() => del(u.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded inline-block"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {(creating || editing) && (
        <UserForm user={editing || empty} onSave={save} onClose={() => { setEditing(null); setCreating(false); }} />
      )}
    </div>
  );
}
function UserForm({ user, onSave, onClose }: any) {
  const isNew = !user.id;
  const [form, setForm] = useState(user);
  const [loading, setLoading] = useState(false);

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
      <div className="bg-white rounded-lg w-full max-w-md p-5 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">{user.id ? 'แก้ไขลูกค้า' : 'เพิ่มลูกค้าใหม่'}</h2>
          <button onClick={onClose}><FiX /></button>
        </div>
        <form onSubmit={async e => {
          e.preventDefault();
          setLoading(true);
          // Don't send password on edit unless it was filled in.
          const payload: any = { ...form };
          if (!isNew && !payload.password) delete payload.password;
          await onSave(payload);
          setLoading(false);
        }} className="space-y-2 text-sm">
          <div>
            <label className="block mb-1 font-medium">ชื่อ *</label>
            <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">อีเมล *</label>
            <input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">เบอร์โทร</label>
            <input value={form.phone || ''} onChange={e => setForm({ ...form, phone: e.target.value })} className="w-full border rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">ที่อยู่</label>
            <textarea rows={2} value={form.address || ''} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border rounded px-3 py-2" />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block mb-1 font-medium">จังหวัด</label>
              <input value={form.province || ''} onChange={e => setForm({ ...form, province: e.target.value })} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="block mb-1 font-medium">รหัสไปรษณีย์</label>
              <input
                maxLength={5}
                pattern="[0-9]{5}"
                value={form.postalCode || ''}
                onChange={e => setForm({ ...form, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                className="w-full border rounded px-3 py-2"
                placeholder="เช่น 10110"
              />
            </div>
          </div>
          <div>
            <label className="block mb-1 font-medium">ระดับ</label>
            <select value={form.role} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full border rounded px-3 py-2">
              <option value="customer">ลูกค้า</option>
              <option value="admin">แอดมิน</option>
            </select>
          </div>
          <div>
            <label className="block mb-1 font-medium">{isNew ? 'รหัสผ่าน *' : 'รหัสผ่านใหม่ (เว้นว่างถ้าไม่เปลี่ยน)'}</label>
            <input
              type="password"
              minLength={6}
              required={isNew}
              value={form.password || ''}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="w-full border rounded px-3 py-2"
              placeholder={isNew ? 'อย่างน้อย 6 ตัวอักษร' : 'ไม่ต้องกรอกหากไม่ต้องการเปลี่ยน'}
            />
          </div>
          <div className="flex gap-2 pt-3 border-t">
            <button type="button" onClick={onClose} className="flex-1 border py-2 rounded">ยกเลิก</button>
            <button disabled={loading} className="flex-1 bg-brand-600 text-white py-2 rounded font-semibold">{loading ? '...' : 'บันทึก'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}