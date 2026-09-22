-- Add จังหวัด (province) and รหัสไปรษณีย์ (postalCode) to User.
-- Splits the address concern: `address` stays as free-form street line,
-- `province` and `postalCode` become structured fields (matching the
-- Order table convention so future admin/customer views stay aligned).
-- Both columns are nullable — existing rows already satisfy the new shape.
ALTER TABLE "User" ADD COLUMN "province" TEXT;
ALTER TABLE "User" ADD COLUMN "postalCode" TEXT;