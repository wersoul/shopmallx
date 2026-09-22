-- Adds optional postalCode to Order so admin can capture it on the
-- order-edit modal (customers don't always fill it on checkout).
-- Nullable so existing rows keep working.
ALTER TABLE "Order" ADD COLUMN "postalCode" TEXT;