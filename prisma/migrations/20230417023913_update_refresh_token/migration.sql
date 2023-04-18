/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `KeyToken` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "KeyToken_refreshToken_key" ON "KeyToken"("refreshToken");
