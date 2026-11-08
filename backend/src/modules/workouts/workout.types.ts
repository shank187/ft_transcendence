import type { ExerciseType, WorkoutSetType } from "@prisma/client";

export interface PlanDay
{
    id: string,
    name: string,
    dayOrder: number,
    exerciseCount: number,
    setCount: number,
}

export interface PlanDetail{
    id:string
    name:string,
    description: string | null,
    type: string
    days: PlanDay[],
}
export interface ExerciseSummary
{
    id: string,
    name: string,
    type: ExerciseType,
    primaryMuscle: string,
    imageUrl: string | null,
}

export interface PlannedSet
{
    id: string,
    setNumber: number,
    setType: WorkoutSetType,
    targetWeight: number | null,
    targetReps: number | null,
    targetDuration: number | null,
    targetDistance: number | null,
}

export interface DayExercise
{
    id: string,
    order: number,
    restSeconds: number | null,
    exerciseSummary: ExerciseSummary,
    sets: PlannedSet[],
}

export interface DayDetail
{
    id: string,
    name: string,
    dayOrder: number,
    planId: string,
    planName: string,
    exercises: DayExercise[],
}
