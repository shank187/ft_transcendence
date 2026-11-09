import type { ExerciseType, Prisma } from "@prisma/client";

export interface ExerciseSummary
{
    id: string,
    name: string,
    type: ExerciseType,
    primaryMuscle: string,
    imageUrl: string | null,
}

// The exercise as the day editor and the workout page show it.
export const exerciseSummarySelect = {
    id: true,
    name: true,
    type: true,
    imageUrl: true,
    primaryMuscleGroup: { select: { name: true } },
} satisfies Prisma.ExerciseSelect;

type ExerciseSummaryRowDb = Prisma.ExerciseGetPayload<{ select: typeof exerciseSummarySelect }>;

export function toExerciseSummaryDto(row: ExerciseSummaryRowDb): ExerciseSummary
{
    return {
        id: row.id,
        name: row.name,
        type: row.type,
        primaryMuscle: row.primaryMuscleGroup.name,
        imageUrl: row.imageUrl,
    }
}
