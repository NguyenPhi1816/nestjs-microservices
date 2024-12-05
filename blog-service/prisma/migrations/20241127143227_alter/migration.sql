/*
  Warnings:

  - Added the required column `image` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageId` to the `Blog` table without a default value. This is not possible if the table is not empty.
  - Added the required column `image` to the `BlogCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `imageId` to the `BlogCategory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "imageId" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "BlogCategory" ADD COLUMN     "image" TEXT NOT NULL,
ADD COLUMN     "imageId" TEXT NOT NULL;
