/*
  Warnings:

  - Made the column `publicId` on table `BaseProductImage` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "BaseProductImage" ALTER COLUMN "publicId" SET NOT NULL;
