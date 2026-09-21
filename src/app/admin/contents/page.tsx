import { prisma, ensurePrisma } from '@/lib/prisma';
import ContentsManager from './ContentsManager';

export const dynamic = 'force-dynamic';

export default async function AdminContentsPage() {
  const prisma = await ensurePrisma();
  const items = await prisma.content.findMany();
  return <ContentsManager contents={items} />;
}