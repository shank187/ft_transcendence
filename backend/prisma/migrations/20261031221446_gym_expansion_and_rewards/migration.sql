/*
  Warnings:

  - A unique constraint covering the columns `[googleId]` on the table `Gym` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "GymVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "GymSource" AS ENUM ('TEAM', 'IMPORTED', 'MEMBER');

-- CreateEnum
CREATE TYPE "EquipmentCategory" AS ENUM ('FREE_WEIGHTS', 'BENCHES_RACKS', 'MACHINES', 'CABLES_ATTACHMENTS', 'CARDIO', 'ACCESSORIES', 'OTHER');

-- CreateEnum
CREATE TYPE "GymSubmissionKind" AS ENUM ('NEW_GYM', 'VERIFY', 'CORRECTION');

-- CreateEnum
CREATE TYPE "GymSubmissionStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "GymRejectReason" AS ENUM ('ALREADY_LISTED', 'NOT_A_GYM', 'CANT_CONFIRM', 'OTHER');

-- CreateEnum
CREATE TYPE "XpReason" AS ENUM ('WORKOUT_COMPLETED', 'PR_SET', 'GYM_APPROVED');

-- DropForeignKey
ALTER TABLE "Gym" DROP CONSTRAINT "Gym_createdById_fkey";

-- AlterTable
ALTER TABLE "Equipment" ADD COLUMN     "category" "EquipmentCategory" NOT NULL DEFAULT 'OTHER';

-- AlterTable
ALTER TABLE "Gym" ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "googleId" TEXT,
ADD COLUMN     "source" "GymSource" NOT NULL DEFAULT 'TEAM',
ADD COLUMN     "verifiedAt" TIMESTAMP(3),
ADD COLUMN     "visibility" "GymVisibility" NOT NULL DEFAULT 'PUBLIC',
ALTER COLUMN "createdById" DROP NOT NULL;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "currentGymId" TEXT;

-- AlterTable
ALTER TABLE "WorkoutSet" ADD COLUMN     "isPr" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "GymSubmission" (
    "id" TEXT NOT NULL,
    "kind" "GymSubmissionKind" NOT NULL,
    "status" "GymSubmissionStatus" NOT NULL DEFAULT 'PENDING',
    "submitterId" TEXT NOT NULL,
    "gymId" TEXT,
    "privateCopyId" TEXT,
    "name" TEXT,
    "city" TEXT,
    "address" TEXT,
    "closed" BOOLEAN NOT NULL DEFAULT false,
    "note" TEXT,
    "seenOn" DATE,
    "baseGymUpdatedAt" TIMESTAMP(3),
    "reviewerId" TEXT,
    "reviewedAt" TIMESTAMP(3),
    "rejectReason" "GymRejectReason",
    "rejectDetail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GymSubmission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GymSubmissionEquipment" (
    "submissionId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,

    CONSTRAINT "GymSubmissionEquipment_pkey" PRIMARY KEY ("submissionId","equipmentId")
);

-- CreateTable
CREATE TABLE "GymSubmissionPhoto" (
    "submissionId" TEXT NOT NULL,
    "mediaId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,

    CONSTRAINT "GymSubmissionPhoto_pkey" PRIMARY KEY ("submissionId","position")
);

-- CreateTable
CREATE TABLE "XpEvent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "reason" "XpReason" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "XpEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserAchievement" (
    "userId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unlockedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserAchievement_pkey" PRIMARY KEY ("userId","code")
);

-- CreateIndex
CREATE INDEX "GymSubmission_status_createdAt_idx" ON "GymSubmission"("status", "createdAt");

-- CreateIndex
CREATE INDEX "GymSubmission_submitterId_createdAt_idx" ON "GymSubmission"("submitterId", "createdAt");

-- CreateIndex
CREATE INDEX "GymSubmission_gymId_status_idx" ON "GymSubmission"("gymId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "GymSubmissionPhoto_mediaId_key" ON "GymSubmissionPhoto"("mediaId");

-- CreateIndex
CREATE INDEX "XpEvent_userId_idx" ON "XpEvent"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "XpEvent_reason_sourceId_key" ON "XpEvent"("reason", "sourceId");

-- CreateIndex
CREATE UNIQUE INDEX "Gym_googleId_key" ON "Gym"("googleId");

-- CreateIndex
CREATE INDEX "Gym_visibility_verified_closedAt_idx" ON "Gym"("visibility", "verified", "closedAt");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_currentGymId_fkey" FOREIGN KEY ("currentGymId") REFERENCES "Gym"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Gym" ADD CONSTRAINT "Gym_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymSubmission" ADD CONSTRAINT "GymSubmission_submitterId_fkey" FOREIGN KEY ("submitterId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymSubmission" ADD CONSTRAINT "GymSubmission_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymSubmission" ADD CONSTRAINT "GymSubmission_gymId_fkey" FOREIGN KEY ("gymId") REFERENCES "Gym"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymSubmission" ADD CONSTRAINT "GymSubmission_privateCopyId_fkey" FOREIGN KEY ("privateCopyId") REFERENCES "Gym"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymSubmissionEquipment" ADD CONSTRAINT "GymSubmissionEquipment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "GymSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymSubmissionEquipment" ADD CONSTRAINT "GymSubmissionEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymSubmissionPhoto" ADD CONSTRAINT "GymSubmissionPhoto_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "GymSubmission"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GymSubmissionPhoto" ADD CONSTRAINT "GymSubmissionPhoto_mediaId_fkey" FOREIGN KEY ("mediaId") REFERENCES "Media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "XpEvent" ADD CONSTRAINT "XpEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserAchievement" ADD CONSTRAINT "UserAchievement_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
