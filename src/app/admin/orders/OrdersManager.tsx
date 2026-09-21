'use client';
import { useState } from 'react';
import { FiEye, FiTrash2, FiX } from 'react-icons/fi';
import { priceFormat, statusLabel, statusColor } from '@/lib/settings';

const statuses = ['pending', 'paid', 'verified', 'shipping', 'completed', 'cancelled'];

export default function OrdersManager({ orders: initial }: { orders: any[] }) {
  const [orders, setOrders] = useState(initial);
  const [filter, setFilter] = useState('all');
  const [viewing, setViewing] = useState<any>(null);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const r = await res.json();
    if (r.success) setOrders(orders.map(o => o.id === id ? r.order : o));
  };

  const del = async (id: string) => {
    if (!confirm('ลบคำสั่งซื้อนี้?')) return;
    await fetch(`/api/admin/orders/${id}`, { method: 'DELETE' });
    setOrders(orders.filter(o => o.id !== id));
  };

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div>
      <div className="bg-white rounded-lg shadow-card p-4 mb-3">
        <h1 className="text-2xl font-bold">🛒 จัดการคำสั่งซื้อ</h1>
        <p className="text-sm text-gray-500">ทั้งหมด {orders.length} รายการ</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 rounded text-sm ${filter === 'all' ? 'bg-brand-600 text-white' : 'bg-gray-100'}`}>ทั้งหมด ({orders.length})</button>
          {statuses.map(s => (
            <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1 rounded text-sm ${filter === s ? 'bg-brand-600 text-white' : 'bg-gray-100'}`}>
              {statusLabel(s)} ({orders.filter(o => o.status === s).length})
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-xs uppercase">
            <tr>
              <th className="text-left px-3 py-2">เลขที่</th>
              <th className="text-left px-3 py-2">ลูกค้า</th>
              <th className="text-right px-3 py-2">ยอด</th>
              <th className="text-center px-3 py-2">สถานะ</th>
              <th className="text-center px-3 py-2">วันที่</th>
              <th className="text-center px-3 py-2">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(o => (
              <tr key={o.id} className="border-t hover:bg-gray-50">
                <td className="px-3 py-2 font-mono text-xs">{o.orderNumber}</td>
                <td className="px-3 py-2">
                  <div className="font-medium">{o.customerName}</div>
                  <div className="text-xs text-gray-500">{o.customerPhone}</div>
                </td>
                <td className="px-3 py-2 text-right font-bold">฿{priceFormat(o.total)}</td>
                <td className="px-3 py-2 text-center">
                  <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                    className={`text-xs border rounded px-2 py-1 ${statusColor(o.status)}`}>
                    {statuses.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
                  </select>
                </td>
                <td className="px-3 py-2 text-center text-xs">{new Date(o.createdAt).toLocaleDateString('th-TH')}</td>
                <td className="px-3 py-2 text-center">
                  <button onClick={() => setViewing(o)} className="text-blue-600 hover:bg-blue-50 p-1.5 rounded"><FiEye /></button>
                  <button onClick={() => del(o.id)} className="text-red-600 hover:bg-red-50 p-1.5 rounded"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {viewing && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
          <div className="bg-white rounded-lg w-full max-w-2xl p-5 max-h-[90vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="font-bold">รายละเอียดคำสั่งซื้อ #{viewing.orderNumber}</h2>
              <button onClick={() => setViewing(null)}><FiX /></button>
            </div>
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div><span className="text-gray-500">ลูกค้า:</span> {viewing.customerName}</div>
                <div><span className="text-gray-500">โทร:</span> {viewing.customerPhone}</div>
                <div className="col-span-2"><span className="text-gray-500">ที่อยู่:</span> {viewing.address} {viewing.province}</div>
                <div><span className="text-gray-500">ชำระ:</span> {viewing.paymentMethod}</div>
                <div><span className="text-gray-500">สถานะ:</span> <span className={`px-2 py-0.5 rounded-full text-xs ${statusColor(viewing.status)}`}>{statusLabel(viewing.status)}</span></div>
              </div>
              <div className="border-t pt-3">
                <h3 className="font-bold mb-2">รายการสินค้า</h3>
                {viewing.items.map((it: any) => (
                  <div key={it.id} className="flex justify-between py-1 border-b last:border-0">
                    <div>{it.name} <span className="text-gray-500">x{it.quantity}</span></div>
                    <div className="font-semibold">฿{priceFormat(it.subtotal)}</div>
                  </div>
                ))}
              </div>
              <div className="border-t pt-2 flex justify-between font-bold text-lg">
                <span>รวม</span><span className="text-brand-600">฿{priceFormat(viewing.total)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}