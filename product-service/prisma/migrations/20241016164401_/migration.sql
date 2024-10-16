/*
  Warnings:

  - A unique constraint covering the columns `[baseProductId,isDefault]` on the table `BaseProductImage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BaseProductImage_baseProductId_isDefault_key" ON "BaseProductImage"("baseProductId", "isDefault");
