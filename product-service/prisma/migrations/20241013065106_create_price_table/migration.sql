/*
  Warnings:

  - You are about to drop the column `price` on the `ProductVariant` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "ProductVariant" DROP COLUMN "price";

-- CreateTable
CREATE TABLE "Price" (
    "createdAt" TIMESTAMP(3) NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "productVariantId" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Price_productVariantId_createdAt_key" ON "Price"("productVariantId", "createdAt");

-- AddForeignKey
ALTER TABLE "Price" ADD CONSTRAINT "Price_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
