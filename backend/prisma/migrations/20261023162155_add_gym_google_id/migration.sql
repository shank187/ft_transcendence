/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `Gym` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Gym" ADD COLUMN     "googleId" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Gym_googleId_key" ON "Gym"("googleId");
