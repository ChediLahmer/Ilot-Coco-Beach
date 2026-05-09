-- Drop unique constraint on device_id (allow multiple reviews per device)
DROP INDEX IF EXISTS "reviews_device_id_key";

-- Change default for visible from true to false (new reviews need approval)
ALTER TABLE "reviews" ALTER COLUMN "visible" SET DEFAULT false;
