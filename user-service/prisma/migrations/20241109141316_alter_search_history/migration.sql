/*
  Warnings:

  - You are about to drop the column `categoryId` on the `UserSearchHistory` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "UserSearchHistory_categoryId_createdAt_idx";

-- AlterTable
ALTER TABLE "UserSearchHistory" DROP COLUMN "categoryId";
