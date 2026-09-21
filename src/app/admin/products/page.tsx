import { d1All } from '@/lib/d1';
import { priceFormat } from '@/lib/settings';
import ProductsManager from './ProductsManager';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const [productRows, categories] = await Promise.all([
    d1All<any>(
      `SELECT p.id, p.name, p.slug, p.description, p.price, p.salePrice, p.stock, p.images, p.brand,
              p.isActive, p.isFeatured, p.isNew, p.categoryId, p.subCategoryId, p.createdAt,
              c.name as categoryName, c.slug as categorySlug,
              sc.name as subCategoryName
       FROM Product p
       LEFT JOIN Category c ON p.categoryId = c.id
       LEFT JOIN Category sc ON p.subCategoryId = sc.id
       ORDER BY p.createdAt DESC`
    ),
    d1All<any>('SELECT id, name, slug, parentId, sortOrder, isActive FROM Category ORDER BY sortOrder ASC')
  ]);
  return <ProductsManager products={productRows} categories={categories} />;
}