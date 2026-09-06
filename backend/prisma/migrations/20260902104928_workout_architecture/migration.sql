/*
  Warnings:

  - You are about to drop the column `equipment` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `muscleGroup` on the `Exercise` table. All the data in the column will be lost.
  - You are about to drop the column `isTemplate` on the `WorkoutPlan` table. All the data in the column will be lost.
  - You are about to drop the column `workoutPlanId` on the `WorkoutSession` table. All the data in the column will be lost.
  - You are about to drop the column `exerciseId` on the `WorkoutSet` table. All the data in the column will be lost.
  - You are about to drop the column `notes` on the `WorkoutSet` table. All the data in the column will be lost.
  - You are about to drop the column `workoutSessionId` on the `WorkoutSet` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Exercise` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[workoutSessionExerciseId,setNumber]` on the table `WorkoutSet` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `primaryMuscleGroupId` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `Exercise` table without a default value. This is not possible if the table is not empty.
  - Added the required column `workoutSessionExerciseId` to the `WorkoutSet` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "ExerciseType" AS ENUM ('WEIGHT_REPS', 'BODYWEIGHT_REPS', 'WEIGHTED_BODYWEIGHT', 'ASSISTED_BODYWEIGHT', 'DURATION', 'WEIGHT_DURATION', 'DISTANCE_DURATION');

-- CreateEnum
CREATE TYPE "WorkoutPlanType" AS ENUM ('CUSTOM', 'RECOMMENDED');

-- CreateEnum
CREATE TYPE "WorkoutSetType" AS ENUM ('NORMAL', 'HEAVY', 'WARMUP', 'DROP', 'FAILURE');

-- CreateEnum
CREATE TYPE "WorkoutSessionStatus" AS ENUM ('IN_PROGRESS', 'COMPLETED', 'CANCELLED');

-- DropForeignKey
ALTER TABLE "WorkoutPlan" DROP CONSTRAINT "WorkoutPlan_userId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutSession" DROP CONSTRAINT "WorkoutSession_workoutPlanId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutSet" DROP CONSTRAINT "WorkoutSet_exerciseId_fkey";

-- DropForeignKey
ALTER TABLE "WorkoutSet" DROP CONSTRAINT "WorkoutSet_workoutSessionId_fkey";

-- DropIndex
DROP INDEX "Exercise_muscleGroup_idx";

-- DropIndex
DROP INDEX "Exercise_name_idx";

-- DropIndex
DROP INDEX "WorkoutPlan_isTemplate_idx";

-- DropIndex
DROP INDEX "WorkoutSession_workoutPlanId_idx";

-- DropIndex
DROP INDEX "WorkoutSet_exerciseId_idx";

-- DropIndex
DROP INDEX "WorkoutSet_workoutSessionId_exerciseId_setNumber_key";

-- AlterTable
ALTER TABLE "Exercise" DROP COLUMN "equipment",
DROP COLUMN "muscleGroup",
ADD COLUMN     "primaryMuscleGroupId" TEXT NOT NULL,
ADD COLUMN     "type" "ExerciseType" NOT NULL;

-- AlterTable
ALTER TABLE "WorkoutExercise" ADD COLUMN     "restSeconds" INTEGER,
ADD COLUMN     "supersetGroup" INTEGER;

-- AlterTable
ALTER TABLE "WorkoutPlan" DROP COLUMN "isTemplate",
ADD COLUMN     "type" "WorkoutPlanType" NOT NULL DEFAULT 'CUSTOM';

-- AlterTable
ALTER TABLE "WorkoutSession" DROP COLUMN "workoutPlanId",
ADD COLUMN     "bodyWeightKg" DOUBLE PRECISION,
ADD COLUMN     "status" "WorkoutSessionStatus" NOT NULL DEFAULT 'IN_PROGRESS',
ADD COLUMN     "workoutDayId" TEXT;

-- AlterTable
ALTER TABLE "WorkoutSet" DROP COLUMN "exerciseId",
DROP COLUMN "notes",
DROP COLUMN "workoutSessionId",
ADD COLUMN     "completedAt" TIMESTAMP(3),
ADD COLUMN     "plannedDistance" DOUBLE PRECISION,
ADD COLUMN     "plannedDuration" INTEGER,
ADD COLUMN     "plannedReps" INTEGER,
ADD COLUMN     "plannedWeight" DOUBLE PRECISION,
ADD COLUMN     "setType" "WorkoutSetType" NOT NULL DEFAULT 'NORMAL',
ADD COLUMN     "workoutSessionExerciseId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MuscleGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "MuscleGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ExerciseSecondaryMuscle" (
    "exerciseId" TEXT NOT NULL,
    "muscleGroupId" TEXT NOT NULL,

    CONSTRAINT "ExerciseSecondaryMuscle_pkey" PRIMARY KEY ("exerciseId","muscleGroupId")
);

-- CreateTable
CREATE TABLE "ExerciseEquipment" (
    "exerciseId" TEXT NOT NULL,
    "equipmentId" TEXT NOT NULL,

    CONSTRAINT "ExerciseEquipment_pkey" PRIMARY KEY ("exerciseId","equipmentId")
);

-- CreateTable
CREATE TABLE "WorkoutExerciseSet" (
    "id" TEXT NOT NULL,
    "workoutExerciseId" TEXT NOT NULL,
    "setNumber" INTEGER NOT NULL,
    "setType" "WorkoutSetType" NOT NULL DEFAULT 'NORMAL',
    "targetWeight" DOUBLE PRECISION,
    "targetReps" INTEGER,
    "targetDuration" INTEGER,
    "targetDistance" DOUBLE PRECISION,

    CONSTRAINT "WorkoutExerciseSet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WorkoutSessionExercise" (
    "id" TEXT NOT NULL,
    "workoutSessionId" TEXT NOT NULL,
    "exerciseId" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "notes" TEXT,
    "restSeconds" INTEGER,
    "supersetGroup" INTEGER,

    CONSTRAINT "WorkoutSessionExercise_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MuscleGroup_name_key" ON "MuscleGroup"("name");

-- CreateIndex
CREATE INDEX "ExerciseSecondaryMuscle_muscleGroupId_idx" ON "ExerciseSecondaryMuscle"("muscleGroupId");

-- CreateIndex
CREATE INDEX "ExerciseEquipment_equipmentId_idx" ON "ExerciseEquipment"("equipmentId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutExerciseSet_workoutExerciseId_setNumber_key" ON "WorkoutExerciseSet"("workoutExerciseId", "setNumber");

-- CreateIndex
CREATE INDEX "WorkoutSessionExercise_exerciseId_idx" ON "WorkoutSessionExercise"("exerciseId");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSessionExercise_workoutSessionId_order_key" ON "WorkoutSessionExercise"("workoutSessionId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "Exercise_name_key" ON "Exercise"("name");

-- CreateIndex
CREATE INDEX "Exercise_primaryMuscleGroupId_idx" ON "Exercise"("primaryMuscleGroupId");

-- CreateIndex
CREATE INDEX "WorkoutPlan_type_idx" ON "WorkoutPlan"("type");

-- CreateIndex
CREATE INDEX "WorkoutSession_workoutDayId_idx" ON "WorkoutSession"("workoutDayId");

-- CreateIndex
CREATE INDEX "WorkoutSession_userId_status_idx" ON "WorkoutSession"("userId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "WorkoutSet_workoutSessionExerciseId_setNumber_key" ON "WorkoutSet"("workoutSessionExerciseId", "setNumber");

-- AddForeignKey
ALTER TABLE "Exercise" ADD CONSTRAINT "Exercise_primaryMuscleGroupId_fkey" FOREIGN KEY ("primaryMuscleGroupId") REFERENCES "MuscleGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSecondaryMuscle" ADD CONSTRAINT "ExerciseSecondaryMuscle_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseSecondaryMuscle" ADD CONSTRAINT "ExerciseSecondaryMuscle_muscleGroupId_fkey" FOREIGN KEY ("muscleGroupId") REFERENCES "MuscleGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseEquipment" ADD CONSTRAINT "ExerciseEquipment_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExerciseEquipment" ADD CONSTRAINT "ExerciseEquipment_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutPlan" ADD CONSTRAINT "WorkoutPlan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutExerciseSet" ADD CONSTRAINT "WorkoutExerciseSet_workoutExerciseId_fkey" FOREIGN KEY ("workoutExerciseId") REFERENCES "WorkoutExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSession" ADD CONSTRAINT "WorkoutSession_workoutDayId_fkey" FOREIGN KEY ("workoutDayId") REFERENCES "WorkoutDay"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSessionExercise" ADD CONSTRAINT "WorkoutSessionExercise_workoutSessionId_fkey" FOREIGN KEY ("workoutSessionId") REFERENCES "WorkoutSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSessionExercise" ADD CONSTRAINT "WorkoutSessionExercise_exerciseId_fkey" FOREIGN KEY ("exerciseId") REFERENCES "Exercise"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkoutSet" ADD CONSTRAINT "WorkoutSet_workoutSessionExerciseId_fkey" FOREIGN KEY ("workoutSessionExerciseId") REFERENCES "WorkoutSessionExercise"("id") ON DELETE CASCADE ON UPDATE CASCADE;
