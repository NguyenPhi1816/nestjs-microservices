-- CreateTable
CREATE TABLE "UserSearchHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "searchQuery" TEXT NOT NULL,
    "categoryId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserSearchHistory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserSearchHistory_userId_createdAt_idx" ON "UserSearchHistory"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "UserSearchHistory_categoryId_createdAt_idx" ON "UserSearchHistory"("categoryId", "createdAt");

-- AddForeignKey
ALTER TABLE "UserSearchHistory" ADD CONSTRAINT "UserSearchHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
