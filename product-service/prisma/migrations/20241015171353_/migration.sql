/*
  Warnings:

  - A unique constraint covering the columns `[publicId]` on the table `BaseProductImage` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BaseProductImage_publicId_key" ON "BaseProductImage"("publicId");
