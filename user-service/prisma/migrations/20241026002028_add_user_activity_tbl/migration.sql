-- CreateTable
CREATE TABLE "UserActivity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "productId" INTEGER,
    "activityType" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserActivity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserActivity_userId_categoryId_idx" ON "UserActivity"("userId", "categoryId");

-- CreateIndex
CREATE INDEX "UserActivity_categoryId_createdAt_idx" ON "UserActivity"("categoryId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserActivity" ADD CONSTRAINT "UserActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
