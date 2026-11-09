import type { WorkoutSetType } from "@prisma/client";
import type { ExerciseSummary } from "../exercises/exercise-summary";

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
