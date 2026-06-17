/*
  Warnings:

  - Made the column `name` on table `menu_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price_standard` on table `menu_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price_extra` on table `menu_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `category_id` on table `menu_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `spaces` required. This step will fail if there are existing NULL values in that column.
  - Made the column `price` on table `spaces` required. This step will fail if there are existing NULL values in that column.
  - Made the column `capacity` on table `spaces` required. This step will fail if there are existing NULL values in that column.
  - Made the column `name` on table `gallery_categories` required. This step will fail if there are existing NULL values in that column.
  - Made the column `url` on table `gallery_images` required. This step will fail if there are existing NULL values in that column.
  - Made the column `title` on table `flash_sales` required. This step will fail if there are existing NULL values in that column.
  - Made the column `discount_percent` on table `flash_sales` required. This step will fail if there are existing NULL values in that column.
  - Made the column `ends_at` on table `flash_sales` required. This step will fail if there are existing NULL values in that column.
  - Made the column `code` on table `vouchers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `discount_percent` on table `vouchers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `valid_until` on table `vouchers` required. This step will fail if there are existing NULL values in that column.
  - Made the column `user_name` on table `reviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `comment` on table `reviews` required. This step will fail if there are existing NULL values in that column.
  - Made the column `rating` on table `reviews` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "menu_items" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "price_standard" SET NOT NULL,
ALTER COLUMN "price_extra" SET NOT NULL,
ALTER COLUMN "category_id" SET NOT NULL;

-- AlterTable
ALTER TABLE "spaces" ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "price" SET NOT NULL,
ALTER COLUMN "capacity" SET NOT NULL;

-- AlterTable
ALTER TABLE "gallery_categories" ALTER COLUMN "name" SET NOT NULL;

-- AlterTable
ALTER TABLE "gallery_images" ALTER COLUMN "url" SET NOT NULL;

-- AlterTable
ALTER TABLE "flash_sales" ALTER COLUMN "title" SET NOT NULL,
ALTER COLUMN "discount_percent" SET NOT NULL,
ALTER COLUMN "ends_at" SET NOT NULL;

-- AlterTable
ALTER TABLE "vouchers" ALTER COLUMN "code" SET NOT NULL,
ALTER COLUMN "discount_percent" SET NOT NULL,
ALTER COLUMN "valid_until" SET NOT NULL;

-- AlterTable
ALTER TABLE "reviews" ALTER COLUMN "user_name" SET NOT NULL,
ALTER COLUMN "comment" SET NOT NULL,
ALTER COLUMN "rating" SET NOT NULL;

-- Add CHECK constraints for valid ranges
ALTER TABLE "menu_items" ADD CONSTRAINT "valid_prices" CHECK ("price_standard" >= 0 AND "price_extra" >= 0);
ALTER TABLE "spaces" ADD CONSTRAINT "valid_space_price" CHECK ("price" > 0);
ALTER TABLE "spaces" ADD CONSTRAINT "valid_capacity" CHECK ("capacity" > 0);
ALTER TABLE "flash_sales" ADD CONSTRAINT "valid_discount" CHECK ("discount_percent" >= 1 AND "discount_percent" <= 100);
ALTER TABLE "vouchers" ADD CONSTRAINT "valid_voucher_discount" CHECK ("discount_percent" >= 1 AND "discount_percent" <= 100);
ALTER TABLE "reviews" ADD CONSTRAINT "valid_rating" CHECK ("rating" >= 1 AND "rating" <= 5);
