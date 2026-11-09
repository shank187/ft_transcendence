import type { WorkoutSessionStatus, WorkoutSetType } from "@prisma/client";
import type { ExerciseSummary } from "../exercises/exercise-summary";

export interface WorkoutSessionSet
{
    id: string,
    setType: WorkoutSetType,
    setNumber: number,
    plannedWeight: number | null,
    plannedReps: number | null,
    plannedDuration: number | null,
    plannedDistance: number | null,
    weight: number | null,
    reps: number | null,
    duration: number | null,
    distance: number | null,
    completedAt: string | null,
}

export interface WorkoutSessionExercise
{
    id: string,
    order: number,
    exerciseSummary: ExerciseSummary,
    restSeconds: number | null,
    sets: WorkoutSessionSet[],
}

export interface WorkoutSession
{
    id: string,
    name: string,
    workoutDayId: string | null,
    status: WorkoutSessionStatus,
    startedAt: string,
    completedAt: string | null,
    bodyWeightKg: number | null,
    exercises: WorkoutSessionExercise[],
    // Only a COMPLETED session has one.
    summary: WorkoutSummary | null,
}

// S3 -> S5 contract ("Workout results").
export interface WorkoutSummary
{
    durationSeconds: number,
    setsCompleted: number,
    setsTotal: number,
    volumeKg: number,
    exerciseCount: number,
    prSetIds: string[],
}
