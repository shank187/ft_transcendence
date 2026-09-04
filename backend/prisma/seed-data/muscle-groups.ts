
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const MUSCLE_GROUPS = [
    "Upper Back",
    "Lower Back",
    "Chest",
    "Shoulders",
    "Biceps",
    "Triceps",
    "Forearms",
    "Abdominals",
    "Oblique",
    "Quadriceps",
    "Glutes",
    "Hamstrings",
    "Calves"
] as const;

export type MuscleGroupName = typeof MUSCLE_GROUPS[number];


async function seedMuscleGroups() {
    await prisma.muscleGroup.createMany({
        data: MUSCLE_GROUPS.map((name) => ({
            name,
        })),
        skipDuplicates: true
    });
}
