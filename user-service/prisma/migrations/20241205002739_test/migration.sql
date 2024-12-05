/*
  Warnings:

  - Made the column `productId` on table `UserActivity` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "UserActivity" ALTER COLUMN "productId" SET NOT NULL;
