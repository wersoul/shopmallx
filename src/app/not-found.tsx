import Link from 'next/link';

export const runtime = 'edge';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto py-20 text-center">
      <div className="text-7xl font-extrabold text-brand-600 mb-3">404</div>
      <h1 className="text-2xl font-bold mb-2">ไม่พบหน้าที่ค้นหา</h1>
      <p className="text-gray-600 mb-5">หน้าที่คุณต้องการอาจถูกลบ ย้าย หรือไม่เคยมีอยู่</p>
      <Link href="/" className="bg-brand-600 text-white px-5 py-2 rounded inline-block">กลับหน้าแรก</Link>
    </div>
  );
}