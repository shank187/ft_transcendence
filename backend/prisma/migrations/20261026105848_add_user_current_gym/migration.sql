-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentGymId" TEXT;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentGymId_fkey" FOREIGN KEY ("currentGymId") REFERENCES "Gym"("id") ON DELETE SET NULL ON UPDATE CASCADE;
