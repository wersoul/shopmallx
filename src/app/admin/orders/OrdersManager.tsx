'use client';
import { useMemo, useState } from 'react';
import { FiEye, FiTrash2, FiX, FiPlus, FiDownload, FiSave } from 'react-icons/fi';
import { priceFormat, statusLabel, statusColor } from '@/lib/settings';
import { generateInvoicePdf } from './invoicePdf';

const statuses = ['pending', 'paid', 'verified', 'shipping', 'completed', 'cancelled'];
const paymentMethods = [
  { v: 'transfer', l: 'โอนผ่านธนาคาร' },
  { v: 'cod', l: 'เก็บเงินปลายทาง (COD)' }
];

export default function OrdersManager({ orders: initial, products = [] }: { orders: any[]; products?: any[] }) {
  const [orders, setOrders] = useState(initial);
  const [filter, setFilter] = useState('all');
  const [editing, setEditing] = useState<any>(null);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}`, {
      method: 'PUT', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    const r = await res.json() as any;
    if (r.success) setOrders(orders.map(o => o.id === id ? { ...o, status: r.order.status } : o));
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
                <td className="px-3 py-2 text-center whitespace-nowrap">
                  <button onClick={() => setEditing(o)} title="แก้ไข" className="text-brand-600 hover:bg-brand-50 p-1.5 rounded"><FiEye /></button>
                  <button onClick={() => generateInvoicePdf(o)} title="สร้างใบแจ้งหนี้ PDF" className="text-green-600 hover:bg-green-50 p-1.5 rounded"><FiDownload /></button>
                  <button onClick={() => del(o.id)} title="ลบ" className="text-red-600 hover:bg-red-50 p-1.5 rounded"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <OrderEditModal
          order={editing}
          products={products}
          onClose={() => setEditing(null)}
          onSaved={(updated) => {
            setOrders(orders.map(o => o.id === updated.id ? { ...o, ...updated, items: updated.items } : o));
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

/**
 * Full-edit modal: header fields + editable items list (add/remove/change
 * quantity or price). Save posts the whole payload to /api/admin/orders/[id]
 * which now replaces the items collection. PDF button renders the in-progress
 * form state without saving, so admins can produce an invoice reflecting what
 * they just edited.
 */
function OrderEditModal({ order, onClose, onSaved, products }: { order: any; onClose: () => void; onSaved: (o: any) => void; products: any[] }) {
  const [form, setForm] = useState({
    customerName: order.customerName || '',
    customerPhone: order.customerPhone || '',
    customerEmail: order.customerEmail || '',
    address: order.address || '',
    province: order.province || '',
    postalCode: order.postalCode || '',
    paymentMethod: order.paymentMethod || 'transfer',
    status: order.status || 'pending',
    note: order.note || '',
    shipping: Number(order.shipping) || 0,
    discount: Number(order.discount) || 0
  });
  const [items, setItems] = useState<any[]>(
    (order.items || []).map((it: any) => ({
      id: it.id,
      productId: it.productId || null,
      name: it.name,
      price: Number(it.price) || 0,
      quantity: parseInt(String(it.quantity)) || 1
    }))
  );
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  // Pre-compute a name → product lookup so the "+ เพิ่มรายการ" name input can
  // autocomplete from the existing catalog and auto-fill price + productId.
  const productByName = useMemo(() => {
    const m = new Map<string, any>();
    for (const p of products || []) m.set(p.name, p);
    return m;
  }, [products]);

  const addItem = () => setItems([
    ...items,
    {
      id: 'new_' + Date.now() + Math.random().toString(36).slice(2, 6),
      productId: null,
      name: '',
      price: 0,
      quantity: 1
    }
  ]);
  const removeItem = (idx: number) => setItems(items.filter((_, i) => i !== idx));
  const updateItem = (idx: number, patch: Partial<{ name: string; price: number; quantity: number; productId: string | null }>) => {
    setItems(items.map((it, i) => i === idx ? { ...it, ...patch } : it));
  };

  /**
   * When the admin picks a product from the datalist, mirror its price and
   * productId into the row. If they then edit the name (custom item), we
   * deliberately KEEP the productId — the admin might still want the catalog
   * price as a starting point. The productId can be cleared with the "x"
   * button next to the input.
   */
  const onItemNameChange = (idx: number, rawName: string) => {
    const match = productByName.get(rawName);
    if (match) {
      updateItem(idx, {
        name: rawName,
        price: Number(match.salePrice ?? match.price) || 0,
        productId: match.id
      });
    } else {
      updateItem(idx, { name: rawName });
    }
  };
  const clearItemProductLink = (idx: number) => {
    updateItem(idx, { productId: null });
  };

  const subtotal = items.reduce((s, it) => s + (Number(it.price) || 0) * (parseInt(String(it.quantity)) || 1), 0);
  const total = subtotal + (Number(form.shipping) || 0) - (Number(form.discount) || 0);

  const save = async () => {
    setErr('');
    if (!form.customerName.trim()) return setErr('กรุณากรอกชื่อลูกค้า');
    if (!form.customerPhone.trim()) return setErr('กรุณากรอกเบอร์โทรลูกค้า');
    if (!form.address.trim()) return setErr('กรุณากรอกที่อยู่จัดส่ง');
    // Postal code is optional but if entered it must be 5 digits.
    if (form.postalCode && !/^\d{5}$/.test(form.postalCode)) {
      return setErr('รหัสไปรษณีย์ต้องเป็นตัวเลข 5 หลัก');
    }
    if (items.length === 0) return setErr('ต้องมีรายการสินค้าอย่างน้อย 1 รายการ');
    for (const it of items) {
      if (!it.name.trim()) return setErr('กรุณากรอกชื่อสินค้าทุกรายการ');
      if ((Number(it.price) || 0) < 0) return setErr('ราคาต้องไม่ติดลบ');
      if ((parseInt(String(it.quantity)) || 0) < 1) return setErr('จำนวนต้องอย่างน้อย 1');
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        // strip original item ids — the API regenerates them
        items: items.map(it => ({
          name: it.name,
          price: Number(it.price) || 0,
          quantity: parseInt(String(it.quantity)) || 1,
          productId: it.productId || null
        }))
      };
      const res = await fetch(`/api/admin/orders/${order.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const r = await res.json() as any;
      if (r.success) onSaved(r.order);
      else setErr(r.error || 'บันทึกไม่สำเร็จ');
    } catch {
      setErr('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้');
    } finally {
      setSaving(false);
    }
  };

  const downloadInvoice = () => {
    generateInvoicePdf({
      ...order,
      ...form,
      items: items.map(it => ({
        ...it,
        price: Number(it.price) || 0,
        quantity: parseInt(String(it.quantity)) || 1,
        subtotal: (Number(it.price) || 0) * (parseInt(String(it.quantity)) || 1)
      })),
      shipping: Number(form.shipping) || 0,
      discount: Number(form.discount) || 0,
      total
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-3">
      <div className="bg-white rounded-lg w-full max-w-3xl p-5 max-h-[90vh] overflow-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-bold">แก้ไขคำสั่งซื้อ #{order.orderNumber}</h2>
          <button onClick={onClose}><FiX /></button>
        </div>

        <div className="space-y-4 text-sm">
          {/* Customer / shipping fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-gray-600 mb-1 block">ชื่อลูกค้า *</label>
              <input value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-gray-600 mb-1 block">เบอร์โทร *</label>
              <input value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-600 mb-1 block">อีเมล</label>
              <input type="email" value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-600 mb-1 block">ที่อยู่จัดส่ง *</label>
              <textarea rows={2} value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="w-full border rounded px-3 py-2" />
            </div>
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="text-gray-600 mb-1 block">จังหวัด</label>
                <input
                  value={form.province}
                  onChange={e => setForm({ ...form, province: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="เช่น กรุงเทพมหานคร"
                />
              </div>
              <div>
                <label className="text-gray-600 mb-1 block">รหัสไปรษณีย์</label>
                <input
                  inputMode="numeric"
                  maxLength={5}
                  pattern="\d{5}"
                  value={form.postalCode}
                  onChange={e => setForm({ ...form, postalCode: e.target.value.replace(/\D/g, '').slice(0, 5) })}
                  className="w-full border rounded px-3 py-2"
                  placeholder="เช่น 10110"
                />
              </div>
            </div>
            <div>
              <label className="text-gray-600 mb-1 block">วิธีชำระเงิน</label>
              <select value={form.paymentMethod} onChange={e => setForm({ ...form, paymentMethod: e.target.value })} className="w-full border rounded px-3 py-2">
                {paymentMethods.map(p => <option key={p.v} value={p.v}>{p.l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-gray-600 mb-1 block">สถานะ</label>
              <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className={`border rounded px-3 py-2 ${statusColor(form.status)}`}>
                {statuses.map(s => <option key={s} value={s}>{statusLabel(s)}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-gray-600 mb-1 block">หมายเหตุ</label>
              <textarea rows={2} value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-gray-600 mb-1 block">ค่าจัดส่ง</label>
              <input type="number" min={0} value={form.shipping} onChange={e => setForm({ ...form, shipping: Number(e.target.value) })} className="w-full border rounded px-3 py-2" />
            </div>
            <div>
              <label className="text-gray-600 mb-1 block">ส่วนลด</label>
              <input type="number" min={0} value={form.discount} onChange={e => setForm({ ...form, discount: Number(e.target.value) })} className="w-full border rounded px-3 py-2" />
            </div>
          </div>

          {/* Items list */}
          <div className="border-t pt-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold">รายการสินค้า</h3>
              <button onClick={addItem} type="button" className="text-xs bg-brand-50 text-brand-700 hover:bg-brand-100 px-2 py-1 rounded flex items-center gap-1">
                <FiPlus /> เพิ่มรายการ
              </button>
            </div>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={it.id || idx} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-6">
                    <div className="flex items-center gap-1">
                      <input
                        list={`product-suggestions-${idx}`}
                        placeholder="ชื่อสินค้า (พิมพ์เพื่อค้นหาจากสินค้าในระบบ)"
                        value={it.name}
                        onChange={e => onItemNameChange(idx, e.target.value)}
                        className="flex-1 border rounded px-2 py-1.5"
                      />
                      {it.productId && (
                        <button
                          type="button"
                          onClick={() => clearItemProductLink(idx)}
                          className="text-gray-400 hover:text-gray-700 px-1"
                          title="ยกเลิกการเชื่อมโยงกับสินค้าในระบบ (ทำให้เป็นรายการกำหนดเอง)"
                        >
                          <FiX />
                        </button>
                      )}
                    </div>
                    {/* Per-row datalist. Browsers scope datalist by `list` attr,
                        so duplicating the option set per row keeps matches
                        contextual. Only render when we actually have a catalog
                        to suggest from. */}
                    {products && products.length > 0 && (
                      <datalist id={`product-suggestions-${idx}`}>
                        {products.map((p: any) => (
                          <option
                            key={p.id}
                            value={p.name}
                          >
                            {`฿${priceFormat(p.salePrice ?? p.price)}`}
                          </option>
                        ))}
                      </datalist>
                    )}
                  </div>
                  <input
                    type="number" min={0} step="0.01"
                    placeholder="ราคา"
                    value={it.price}
                    onChange={e => updateItem(idx, { price: Number(e.target.value) })}
                    className="col-span-2 border rounded px-2 py-1.5 text-right"
                  />
                  <input
                    type="number" min={1}
                    placeholder="จำนวน"
                    value={it.quantity}
                    onChange={e => updateItem(idx, { quantity: Number(e.target.value) })}
                    className="col-span-2 border rounded px-2 py-1.5 text-right"
                  />
                  <div className="col-span-1 text-right font-semibold">
                    ฿{priceFormat((Number(it.price) || 0) * (parseInt(String(it.quantity)) || 1))}
                  </div>
                  <button
                    type="button" onClick={() => removeItem(idx)}
                    className="col-span-1 text-red-500 hover:bg-red-50 p-1 rounded justify-self-center"
                    title="ลบรายการ"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              ))}
              {items.length === 0 && (
                <div className="text-center text-gray-400 py-4 text-xs">ยังไม่มีรายการสินค้า — กด "เพิ่มรายการ" เพื่อเริ่ม</div>
              )}
            </div>
            <div className="mt-3 border-t pt-2 space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">รวมค่าสินค้า</span><span>฿{priceFormat(subtotal)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ค่าจัดส่ง</span><span>฿{priceFormat(Number(form.shipping) || 0)}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">ส่วนลด</span><span>− ฿{priceFormat(Number(form.discount) || 0)}</span></div>
              <div className="flex justify-between font-bold text-base border-t pt-1"><span>รวมทั้งสิ้น</span><span className="text-brand-600">฿{priceFormat(total)}</span></div>
            </div>
          </div>

          {err && <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-xs">{err}</div>}

          {/* Actions */}
          <div className="flex flex-wrap gap-2 justify-between pt-3 border-t">
            <button type="button" onClick={downloadInvoice} className="border border-green-600 text-green-700 hover:bg-green-50 px-3 py-2 rounded flex items-center gap-1 text-sm">
              <FiDownload /> สร้างใบแจ้งหนี้ PDF
            </button>
            <div className="flex gap-2">
              <button type="button" onClick={onClose} className="border px-4 py-2 rounded">ยกเลิก</button>
              <button type="button" onClick={save} disabled={saving} className="bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white px-4 py-2 rounded flex items-center gap-1">
                <FiSave /> {saving ? 'กำลังบันทึก...' : 'บันทึกการแก้ไข'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}