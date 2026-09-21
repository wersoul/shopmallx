import { prisma, ensurePrisma } from '@/lib/prisma';
import ContentsManager from './ContentsManager';

export const dynamic = 'force-dynamic';

export default async function AdminContentsPage() {
  try {
    const prisma = await ensurePrisma();
    const items = await prisma.content.findMany();
    return <ContentsManager contents={items as any} />;
  } catch (err: any) {
    return <div className="p-6 text-red-600">Contents error: {String(err?.message || err)}</div>;
  }
}