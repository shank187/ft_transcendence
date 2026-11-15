import { PrismaClient } from "@prisma/client";

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
    "Calves",
    "Hip Flexors",
    "Adductors",
    "Cardio",
    "Neck"
] as const;

export async function seedMuscleGroups(prisma: PrismaClient) {
    await prisma.muscleGroup.createMany({
        data: MUSCLE_GROUPS.map((name) => ({
            name,
        })),
        skipDuplicates: true
    });
}
