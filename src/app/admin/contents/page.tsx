import { prisma, ensurePrisma } from '@/lib/prisma';
import ContentsManager from './ContentsManager';

export const dynamic = 'force-dynamic';

export default async function AdminContentsPage() {
  const prisma = await ensurePrisma();
  const items = await prisma.content.findMany();
  // Map to plain strings so Client Component never sees a Date.
  const safe = (items as any[]).map(c => ({ id: c.id, key: c.key, title: c.title, body: c.body }));
  return <ContentsManager contents={safe} />;
}