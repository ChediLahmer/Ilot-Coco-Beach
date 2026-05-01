-- AlterTable
ALTER TABLE "gallery_images" ADD COLUMN     "category_id" INTEGER;

-- CreateTable
CREATE TABLE "gallery_categories" (
    "id" SERIAL NOT NULL,
    "name" JSONB NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "gallery_categories_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "gallery_images" ADD CONSTRAINT "gallery_images_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "gallery_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
