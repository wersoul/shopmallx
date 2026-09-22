-- Make productId nullable on OrderItem so admins can add custom / manual line
-- items (services, custom orders, adjustments) that aren't in the Product
-- catalog. Existing rows still have a productId and the FK still applies
-- when productId IS set.
PRAGMA foreign_keys = OFF;

-- SQLite doesn't support ALTER COLUMN directly. Rebuild the table with the
-- new shape, copying data across, then re-enable FKs. This is the standard
-- SQLite-idiomatic migration pattern.
CREATE TABLE IF NOT EXISTS "OrderItem_new" (
  "id" TEXT PRIMARY KEY NOT NULL,
  "orderId" TEXT NOT NULL,
  "productId" TEXT,
  "name" TEXT NOT NULL,
  "price" REAL NOT NULL,
  "quantity" INTEGER NOT NULL,
  "subtotal" REAL NOT NULL,
  FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE,
  FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT
);
CREATE INDEX IF NOT EXISTS "OrderItem_orderId_idx" ON "OrderItem"("orderId");

INSERT INTO OrderItem_new (id, orderId, productId, name, price, quantity, subtotal)
  SELECT id, orderId, productId, name, price, quantity, subtotal FROM OrderItem;

DROP TABLE OrderItem;
ALTER TABLE OrderItem_new RENAME TO "OrderItem";

PRAGMA foreign_keys = ON;