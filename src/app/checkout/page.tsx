'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { priceFormat } from '@/lib/settings';

export default function CheckoutPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>({});
  const [user, setUser] = useState<any>(null);
  const [form, setForm] = useState({ customerName: '', customerPhone: '', customerEmail: '', address: '', province: '', note: '', paymentMethod: 'transfer' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setItems(JSON.parse(localStorage.getItem('cart') || '[]'));
    fetch('/api/settings').then(r => r.json()).then(setSettings);
    fetch('/api/auth/me').then(r => r.json()).then(u => {
      if (u?.user) {
        setUser(u.user);
        setForm(f => ({ ...f, customerName: u.user.name, customerPhone: u.user.phone || '', customerEmail: u.user.email, address: u.user.address || '' }));
      }
    });
  }, []);

  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const freeMin = parseFloat(settings.free_shipping_min || '1000');
  const shipFee = parseFloat(settings.shipping_fee || '50');
  const shipping = subtotal >= freeMin ? 0 : shipFee;
  const total = subtotal + shipping;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return alert('ตะกร้าสินค้าว่าง');
    setSubmitting(true);
    const res = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, items, subtotal, shipping, total, userId: user?.id })
    });
    const data = await res.json();
    if (data.success) {
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdate'));
      router.push(`/checkout/success?id=${data.orderId}`);
    } else {
      alert(data.error || 'เกิดข้อผิดพลาด');
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-3 py-10 text-center">
        <div className="text-6xl mb-2">🛒</div>
        <p className="text-gray-500">ไม่มีสินค้าในตะกร้า</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-3 py-4">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">ดำเนินการสั่งซื้อ</h1>
      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-lg shadow-card p-4">
            <h3 className="font-bold mb-3">ข้อมูลผู้รับ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <input required placeholder="ชื่อ-นามสกุล *" value={form.customerName} onChange={e => setForm({ ...form, customerName: e.target.value })} className="border rounded px-3 py-2" />
              <input required placeholder="เบอร์โทร *" value={form.customerPhone} onChange={e => setForm({ ...form, customerPhone: e.target.value })} className="border rounded px-3 py-2" />
              <input type="email" placeholder="อีเมล" value={form.customerEmail} onChange={e => setForm({ ...form, customerEmail: e.target.value })} className="border rounded px-3 py-2 md:col-span-2" />
              <input required placeholder="ที่อยู่จัดส่ง *" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="border rounded px-3 py-2 md:col-span-2" />
              <input placeholder="จังหวัด" value={form.province} onChange={e => setForm({ ...form, province: e.target.value })} className="border rounded px-3 py-2 md:col-span-2" />
              <textarea placeholder="หมายเหตุ" value={form.note} onChange={e => setForm({ ...form, note: e.target.value })} className="border rounded px-3 py-2 md:col-span-2" rows={2} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-card p-4">
            <h3 className="font-bold mb-3">วิธีการชำระเงิน</h3>
            <div className="space-y-2 text-sm">
              <label className="flex items-start gap-2 p-3 border rounded cursor-pointer hover:bg-brand-50">
                <input type="radio" name="pay" checked={form.paymentMethod === 'transfer'} onChange={() => setForm({ ...form, paymentMethod: 'transfer' })} />
                <div>
                  <div className="font-semibold">โอนผ่านธนาคาร</div>
                  <div className="text-gray-500 text-xs mt-1">
                    {settings.bank_name} เลขที่บัญชี {settings.bank_account} ชื่อบัญชี {settings.bank_holder}
                  </div>
                </div>
              </label>
              <label className="flex items-center gap-2 p-3 border rounded cursor-pointer hover:bg-brand-50">
                <input type="radio" name="pay" checked={form.paymentMethod === 'cod'} onChange={() => setForm({ ...form, paymentMethod: 'cod' })} />
                <span className="font-semibold">เก็บเงินปลายทาง (COD)</span>
              </label>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-4 h-fit sticky top-32">
          <h3 className="font-bold mb-3">สรุปคำสั่งซื้อ</h3>
          <div className="space-y-2 mb-3 max-h-60 overflow-auto">
            {items.map(i => (
              <div key={i.productId} className="flex gap-2 text-sm">
                <img src={i.image} alt="" className="w-12 h-12 rounded object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="line-clamp-2 text-xs">{i.name}</div>
                  <div className="text-gray-500">x{i.quantity}</div>
                </div>
                <div className="font-semibold whitespace-nowrap">฿{priceFormat(i.price * i.quantity)}</div>
              </div>
            ))}
          </div>
          <div className="border-t pt-2 space-y-1 text-sm">
            <div className="flex justify-between"><span>รวม</span><span>฿{priceFormat(subtotal)}</span></div>
            <div className="flex justify-between"><span>ค่าจัดส่ง</span><span>{shipping === 0 ? 'ฟรี' : `฿${priceFormat(shipping)}`}</span></div>
          </div>
          <div className="border-t mt-2 pt-2 flex justify-between font-bold text-lg">
            <span>รวมทั้งสิ้น</span><span className="text-brand-600">฿{priceFormat(total)}</span>
          </div>
          <button type="submit" disabled={submitting} className="mt-4 w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold py-3 rounded">
            {submitting ? 'กำลังส่ง...' : 'ยืนยันสั่งซื้อ'}
          </button>
        </div>
      </form>
    </div>
  );
}