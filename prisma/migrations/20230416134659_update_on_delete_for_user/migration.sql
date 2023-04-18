-- DropForeignKey
ALTER TABLE "KeyToken" DROP CONSTRAINT "KeyToken_userId_fkey";

-- AddForeignKey
ALTER TABLE "KeyToken" ADD CONSTRAINT "KeyToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
