/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `BaseProduct` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "BaseProduct_name_key" ON "BaseProduct"("name");
