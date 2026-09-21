-- Adds optional subCategoryId to Product so we can store a parent + sub
-- category independently from one another. Nullable so existing rows keep
-- working — they will continue to use categoryId.
ALTER TABLE "Product" ADD COLUMN "subCategoryId" TEXT;
CREATE INDEX IF NOT EXISTS "Product_subCategoryId_idx" ON "Product"("subCategoryId");