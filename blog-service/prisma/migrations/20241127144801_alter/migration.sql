/*
  Warnings:

  - Added the required column `summary` to the `Blog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Blog" ADD COLUMN     "summary" TEXT NOT NULL,
ALTER COLUMN "createAt" SET DEFAULT CURRENT_TIMESTAMP;
