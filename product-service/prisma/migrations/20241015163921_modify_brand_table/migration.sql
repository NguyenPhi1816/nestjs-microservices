/*
  Warnings:

  - Added the required column `imageId` to the `Brand` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Brand" ADD COLUMN     "imageId" TEXT NOT NULL;
