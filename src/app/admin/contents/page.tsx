import { prisma } from '@/lib/prisma';
import ContentsManager from './ContentsManager';

export const dynamic = 'force-dynamic';

export default async function AdminContentsPage() {
  const items = await prisma.content.findMany();
  return <ContentsManager contents={items} />;
}