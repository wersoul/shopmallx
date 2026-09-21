import { prisma, ensurePrisma } from '@/lib/prisma';
import { priceFormat } from '@/lib/settings';
import ProductsManager from './ProductsManager';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const prisma = await ensurePrisma();
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ orderBy: { createdAt: 'desc' }, include: { category: true } }),
    prisma.category.findMany({ orderBy: { sortOrder: 'asc' } })
  ]);
  return <ProductsManager products={products} categories={categories} />;
}