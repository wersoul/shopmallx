import { prisma, ensurePrisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export default async function ContentPage({ params }: { params: { key: string } }) {
  const prisma = await ensurePrisma();
  const content = await prisma.content.findUnique({ where: { key: params.key } });
  if (!content) {
    return (
      <div className="max-w-3xl mx-auto px-3 py-10 text-center">
        <div className="text-6xl mb-2">📄</div>
        <p className="text-gray-500">ไม่พบเนื้อหา</p>
      </div>
    );
  }
  return (
    <div className="max-w-3xl mx-auto px-3 py-6">
      <div className="bg-white rounded-lg shadow-card p-6 md:p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">{content.title}</h1>
        <div className="prose text-gray-700 leading-relaxed whitespace-pre-line text-sm md:text-base">
          {content.body}
        </div>
      </div>
    </div>
  );
}