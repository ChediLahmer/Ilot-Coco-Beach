-- AlterTable
ALTER TABLE "reviews" ADD COLUMN "device_id" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "reviews_device_id_key" ON "reviews"("device_id");
