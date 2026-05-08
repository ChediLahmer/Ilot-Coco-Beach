-- AlterTable
ALTER TABLE "flash_sales" ADD COLUMN     "menu_item_id" INTEGER,
ADD COLUMN     "space_id" INTEGER;

-- CreateIndex
CREATE INDEX "flash_sales_menu_item_id_idx" ON "flash_sales"("menu_item_id");

-- CreateIndex
CREATE INDEX "flash_sales_space_id_idx" ON "flash_sales"("space_id");

-- AddForeignKey
ALTER TABLE "flash_sales" ADD CONSTRAINT "flash_sales_menu_item_id_fkey" FOREIGN KEY ("menu_item_id") REFERENCES "menu_items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flash_sales" ADD CONSTRAINT "flash_sales_space_id_fkey" FOREIGN KEY ("space_id") REFERENCES "spaces"("id") ON DELETE SET NULL ON UPDATE CASCADE;
