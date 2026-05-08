-- CreateIndex
CREATE INDEX "flash_sales_is_active_ends_at_idx" ON "flash_sales"("is_active", "ends_at");

-- CreateIndex
CREATE INDEX "vouchers_is_active_valid_until_idx" ON "vouchers"("is_active", "valid_until");

-- CreateIndex
CREATE INDEX "reviews_visible_id_idx" ON "reviews"("visible", "id");
