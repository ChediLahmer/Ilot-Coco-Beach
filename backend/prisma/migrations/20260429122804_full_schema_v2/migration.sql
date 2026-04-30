/*
  Warnings:

  - You are about to drop the column `type` on the `menu_categories` table. All the data in the column will be lost.
  - You are about to drop the column `price` on the `menu_items` table. All the data in the column will be lost.
  - You are about to drop the column `title` on the `menu_items` table. All the data in the column will be lost.
  - The `description` column on the `menu_items` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `title` on the `spaces` table. All the data in the column will be lost.
  - The `description` column on the `spaces` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `name` on the `menu_categories` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `name` to the `menu_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_extra` to the `menu_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price_standard` to the `menu_items` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `spaces` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "gallery_images" ADD COLUMN     "category" TEXT;

-- AlterTable
ALTER TABLE "menu_categories" DROP COLUMN "type",
DROP COLUMN "name",
ADD COLUMN     "name" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "menu_items" DROP COLUMN "price",
DROP COLUMN "title",
ADD COLUMN     "name" JSONB NOT NULL,
ADD COLUMN     "price_extra" DECIMAL(8,2) NOT NULL,
ADD COLUMN     "price_standard" DECIMAL(8,2) NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- AlterTable
ALTER TABLE "spaces" DROP COLUMN "title",
ADD COLUMN     "name" JSONB NOT NULL,
DROP COLUMN "description",
ADD COLUMN     "description" JSONB;

-- CreateTable
CREATE TABLE "flash_sales" (
    "id" SERIAL NOT NULL,
    "title" JSONB NOT NULL,
    "description" JSONB NOT NULL,
    "discount_percent" INTEGER NOT NULL,
    "image" TEXT,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flash_sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vouchers" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "discount_percent" INTEGER NOT NULL,
    "valid_until" TIMESTAMP(3) NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vouchers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "vouchers_code_key" ON "vouchers"("code");
