/*
  Warnings:

  - Added the required column `imageId` to the `ProductVariant` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "imageId" TEXT NOT NULL;
