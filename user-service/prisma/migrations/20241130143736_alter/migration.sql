/*
  Warnings:

  - Added the required column `searchQueryNormalize` to the `UserSearchHistory` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserSearchHistory" ADD COLUMN     "searchQueryNormalize" TEXT NOT NULL;
