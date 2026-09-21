import { prisma, ensurePrisma } from '@/lib/prisma';
import { FiPhone, FiMail, FiMapPin } from 'react-icons/fi';
import ContactForm from './ContactForm';

export const dynamic = 'force-dynamic';

export default async function ContactPage() {
  const prisma = await ensurePrisma();
  const s = await prisma.setting.findMany();
  const set: any = {};
  s.forEach(x => set[x.key] = x.value);

  return (
    <div className="max-w-4xl mx-auto px-3 py-6">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">ติดต่อเรา</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-lg shadow-card p-6 space-y-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 shrink-0"><FiPhone /></div>
            <div>
              <div className="text-xs text-gray-500">โทร</div>
              <div className="font-bold">{set.phone}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 shrink-0"><FiMail /></div>
            <div>
              <div className="text-xs text-gray-500">อีเมล</div>
              <div className="font-bold">{set.email}</div>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-brand-50 rounded-full flex items-center justify-center text-brand-600 shrink-0"><FiMapPin /></div>
            <div>
              <div className="text-xs text-gray-500">ที่อยู่</div>
              <div className="font-bold">{set.address}</div>
            </div>
          </div>
          <div className="border-t pt-4 text-sm space-y-1">
            <div>Line: <span className="font-semibold">{set.line_id}</span></div>
            <div>Facebook: <span className="font-semibold">{set.facebook}</span></div>
            <div>YouTube: <span className="font-semibold">{set.youtube}</span></div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-card p-6">
          <h3 className="font-bold mb-3">ส่งข้อความถึงเรา</h3>
          <ContactForm />
        </div>
      </div>
    </div>
  );
}