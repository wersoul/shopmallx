/**
 * PDF invoice generator for orders.
 *
 * Strategy: render an offscreen HTML <div> styled to look like a Thai invoice,
 * then use html2canvas to rasterize it into an image, then jspdf to wrap the
 * image into a multi-page PDF. This is the standard approach for non-Latin
 * (Thai/CJK) PDFs in the browser — jsPDF's built-in Helvetica can't render
 * Thai glyphs, and embedding a Thai font would balloon bundle size by
 * 500KB+ and break in CF Pages' edge runtime.
 *
 * Runs entirely client-side — no server PDF generation needed, which keeps
 * the route footprint small and avoids CPU limits on Cloudflare Workers.
 */

const fmt = (n: number) =>
  new Intl.NumberFormat('th-TH', { maximumFractionDigits: 2 }).format(Number(n) || 0);

const STATUS_LABEL: Record<string, string> = {
  pending: 'รอชำระเงิน',
  paid: 'แจ้งชำระแล้ว',
  verified: 'ตรวจสอบแล้ว',
  shipping: 'กำลังจัดส่ง',
  completed: 'สำเร็จ',
  cancelled: 'ยกเลิก'
};

const PAYMENT_LABEL: Record<string, string> = {
  transfer: 'โอนผ่านธนาคาร',
  cod: 'เก็บเงินปลายทาง (COD)'
};

type InvoiceItem = {
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
};

export type InvoiceOrder = {
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string | null;
  address: string;
  province?: string | null;
  postalCode?: string | null;
  paymentMethod?: string | null;
  status?: string;
  items: InvoiceItem[];
  shipping?: number;
  discount?: number;
  total: number;
  createdAt?: string | number | Date;
};

export async function generateInvoicePdf(order: InvoiceOrder): Promise<void> {
  // Lazy-load to avoid SSR issues and keep initial bundle small. jspdf and
  // html2canvas are heavy but they're only fetched on demand.
  const [{ default: jsPDF }, html2canvasModule] = await Promise.all([
    import('jspdf'),
    import('html2canvas')
  ]);
  const html2canvas = (html2canvasModule as any).default || html2canvasModule;

  // Build the invoice DOM off-screen
  const container = document.createElement('div');
  container.style.position = 'fixed';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = '794px'; // ~A4 width @ 96dpi
  container.style.background = '#ffffff';
  container.style.padding = '32px';
  container.style.fontFamily = '"Sarabun", "Noto Sans Thai", system-ui, -apple-system, "Segoe UI", sans-serif';
  container.style.color = '#1f2937';
  container.style.fontSize = '13px';
  container.style.lineHeight = '1.5';

  const createdAt = order.createdAt
    ? new Date(order.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' });

  const subtotal = order.items.reduce(
    (s, it) => s + (Number(it.subtotal) || (Number(it.price) || 0) * (Number(it.quantity) || 1)),
    0
  );
  const shipping = Number(order.shipping) || 0;
  const discount = Number(order.discount) || 0;
  const total = Number(order.total) || (subtotal + shipping - discount);

  container.innerHTML = `
    <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:2px solid #2563eb; padding-bottom:12px; margin-bottom:16px;">
      <div>
        <div style="font-size:22px; font-weight:bold; color:#2563eb;">ใบแจ้งหนี้ / Invoice</div>
        <div style="color:#6b7280; font-size:12px; margin-top:4px;">ออกเมื่อ ${escapeHtml(createdAt)}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:bold;">เลขที่คำสั่งซื้อ</div>
        <div style="font-family:monospace; font-size:14px; color:#2563eb;">${escapeHtml(order.orderNumber)}</div>
        <div style="margin-top:6px;">
          <span style="background:${statusBg(order.status)}; color:${statusFg(order.status)}; padding:2px 8px; border-radius:999px; font-size:11px; font-weight:600;">
            ${escapeHtml(STATUS_LABEL[order.status || ''] || order.status || '')}
          </span>
        </div>
      </div>
    </div>

    <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px;">
      <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">
        <div style="font-weight:bold; color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">ลูกค้า</div>
        <div style="font-weight:600;">${escapeHtml(order.customerName)}</div>
        <div>โทร: ${escapeHtml(order.customerPhone)}</div>
        ${order.customerEmail ? `<div>อีเมล: ${escapeHtml(order.customerEmail)}</div>` : ''}
      </div>
      <div style="background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px; padding:12px;">
        <div style="font-weight:bold; color:#6b7280; font-size:11px; text-transform:uppercase; letter-spacing:0.5px; margin-bottom:6px;">จัดส่งไปที่</div>
        <div>${escapeHtml(order.address || '')}</div>
        ${order.province ? `<div>จังหวัด: ${escapeHtml(order.province)}</div>` : ''}
        ${order.postalCode ? `<div>รหัสไปรษณีย์: ${escapeHtml(order.postalCode)}</div>` : ''}
        <div style="margin-top:6px; color:#6b7280; font-size:11px;">ชำระโดย: ${escapeHtml(PAYMENT_LABEL[order.paymentMethod || ''] || order.paymentMethod || '-')}</div>
      </div>
    </div>

    <table style="width:100%; border-collapse:collapse; margin-bottom:16px;">
      <thead>
        <tr style="background:#f3f4f6;">
          <th style="text-align:left; padding:8px; font-size:11px; color:#6b7280; border-bottom:1px solid #e5e7eb;">#</th>
          <th style="text-align:left; padding:8px; font-size:11px; color:#6b7280; border-bottom:1px solid #e5e7eb;">สินค้า</th>
          <th style="text-align:right; padding:8px; font-size:11px; color:#6b7280; border-bottom:1px solid #e5e7eb;">ราคา</th>
          <th style="text-align:right; padding:8px; font-size:11px; color:#6b7280; border-bottom:1px solid #e5e7eb;">จำนวน</th>
          <th style="text-align:right; padding:8px; font-size:11px; color:#6b7280; border-bottom:1px solid #e5e7eb;">รวม</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((it, i) => `
          <tr>
            <td style="padding:8px; border-bottom:1px solid #f3f4f6;">${i + 1}</td>
            <td style="padding:8px; border-bottom:1px solid #f3f4f6;">${escapeHtml(it.name)}</td>
            <td style="padding:8px; border-bottom:1px solid #f3f4f6; text-align:right;">฿${fmt(it.price)}</td>
            <td style="padding:8px; border-bottom:1px solid #f3f4f6; text-align:right;">${it.quantity}</td>
            <td style="padding:8px; border-bottom:1px solid #f3f4f6; text-align:right; font-weight:600;">฿${fmt(it.subtotal || it.price * it.quantity)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div style="display:flex; justify-content:flex-end;">
      <div style="width:280px;">
        <div style="display:flex; justify-content:space-between; padding:4px 0;">
          <span style="color:#6b7280;">รวมค่าสินค้า</span>
          <span>฿${fmt(subtotal)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; padding:4px 0;">
          <span style="color:#6b7280;">ค่าจัดส่ง</span>
          <span>฿${fmt(shipping)}</span>
        </div>
        ${discount > 0 ? `
        <div style="display:flex; justify-content:space-between; padding:4px 0;">
          <span style="color:#6b7280;">ส่วนลด</span>
          <span>− ฿${fmt(discount)}</span>
        </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; padding:8px 0; border-top:2px solid #2563eb; margin-top:6px; font-size:16px; font-weight:bold; color:#2563eb;">
          <span>รวมทั้งสิ้น</span>
          <span>฿${fmt(total)}</span>
        </div>
      </div>
    </div>

    <div style="margin-top:32px; padding-top:12px; border-top:1px dashed #e5e7eb; text-align:center; color:#9ca3af; font-size:11px;">
      ขอบคุณสำหรับการสั่งซื้อ — ใบแจ้งหนี้นี้ออกโดยระบบอัตโนมัติ
    </div>
  `;

  document.body.appendChild(container);

  try {
    const canvas = await html2canvas(container, {
      scale: 2, // higher dpi for crisp Thai glyphs
      backgroundColor: '#ffffff',
      logging: false,
      useCORS: true
    });

    const imgData = canvas.toDataURL('image/png');

    // A4 portrait: 210 x 297 mm. Image height in mm = canvas.height * (210 / canvas.width)
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageWidthMm = 210;
    const pageHeightMm = 297;
    const imgWidthMm = pageWidthMm;
    const imgHeightMm = (canvas.height * imgWidthMm) / canvas.width;

    if (imgHeightMm <= pageHeightMm) {
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidthMm, imgHeightMm);
    } else {
      // Multi-page: slice the canvas vertically
      const sliceHeightPx = Math.floor((pageHeightMm * canvas.width) / imgWidthMm);
      let yOffsetPx = 0;
      let pageIndex = 0;
      while (yOffsetPx < canvas.height) {
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = Math.min(sliceHeightPx, canvas.height - yOffsetPx);
        const ctx = sliceCanvas.getContext('2d');
        if (ctx) {
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, sliceCanvas.width, sliceCanvas.height);
          ctx.drawImage(canvas, 0, -yOffsetPx);
        }
        const sliceData = sliceCanvas.toDataURL('image/png');
        if (pageIndex > 0) pdf.addPage();
        const sliceHeightMm = (sliceCanvas.height * imgWidthMm) / sliceCanvas.width;
        pdf.addImage(sliceData, 'PNG', 0, 0, imgWidthMm, Math.min(sliceHeightMm, pageHeightMm));
        yOffsetPx += sliceHeightPx;
        pageIndex += 1;
      }
    }

    pdf.save(`invoice-${order.orderNumber}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

function escapeHtml(s: any): string {
  return String(s ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  } as Record<string, string>)[ch] || ch);
}

function statusBg(s?: string): string {
  return ({
    pending: '#fef3c7', paid: '#dbeafe', verified: '#e0e7ff',
    shipping: '#f3e8ff', completed: '#dcfce7', cancelled: '#fee2e2'
  } as Record<string, string>)[s || ''] || '#f3f4f6';
}
function statusFg(s?: string): string {
  return ({
    pending: '#92400e', paid: '#1e40af', verified: '#3730a3',
    shipping: '#6b21a8', completed: '#166534', cancelled: '#991b1b'
  } as Record<string, string>)[s || ''] || '#374151';
}