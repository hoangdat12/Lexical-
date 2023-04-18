/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `KeyToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "KeyToken_userId_key" ON "KeyToken"("userId");
