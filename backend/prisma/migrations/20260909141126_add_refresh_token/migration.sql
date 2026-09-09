-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('BEGINNER', 'INTERMEDIATE', 'ADVANCED');

-- CreateEnum
CREATE TYPE "TrainingGoal" AS ENUM ('BUILD_MUSCLE', 'GAIN_STRENGTH', 'LOSE_FAT', 'IMPROVE_GENERAL_FITNESS', 'IMPROVE_ENDURANCE', 'MAINTAIN_FITNESS');

-- CreateEnum
CREATE TYPE "UnitSystem" AS ENUM ('METRIC', 'IMPERIAL');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "experienceLevel" "ExperienceLevel",
ADD COLUMN     "heightCm" DOUBLE PRECISION,
ADD COLUMN     "onboardingCompletedAt" TIMESTAMP(3),
ADD COLUMN     "primaryGoal" "TrainingGoal",
ADD COLUMN     "refreshToken" TEXT,
ADD COLUMN     "unitSystem" "UnitSystem" NOT NULL DEFAULT 'METRIC',
ADD COLUMN     "weightKg" DOUBLE PRECISION;
