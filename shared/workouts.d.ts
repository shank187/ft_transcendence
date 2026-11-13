// What the workout-plans and workout-sessions APIs send and receive, one copy for both apps.
// Types only, in .d.ts files: the backend's rootDir (src) accepts them, and tsx and Vite
// drop type-only imports, so no container loads this folder at runtime.
// The unions copy enums from backend/prisma/schema.prisma. If Prisma gains a value,
// the backend mappers stop compiling until it is added here.
import type { ExerciseSummary } from "./exercises"

export type WorkoutPlanType = "CUSTOM" | "RECOMMENDED"

export type SetType = "NORMAL" | "HEAVY" | "WARMUP" | "DROP" | "FAILURE"

export type WorkoutSessionStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

// GET /api/workout-plans
export interface WorkoutPlan
{
    id: string,
    name: string,
    description: string | null,
    type: WorkoutPlanType,
    days: number,
}

export interface PlanDay
{
    id: string,
    name: string,
    dayOrder: number,
    exerciseCount: number,
    setCount: number,
}

// GET /api/workout-plans/:planId
export interface PlanDetail
{
    id: string,
    name: string,
    description: string | null,
    type: WorkoutPlanType,
    days: PlanDay[],
}

export interface PlannedSet
{
    id: string,
    setNumber: number,
    setType: SetType,
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

// GET /api/workout-plans/:planId/days/:dayId
export interface DayDetail
{
    id: string,
    name: string,
    dayOrder: number,
    planId: string,
    planName: string,
    exercises: DayExercise[],
}

export type SetTargets = Pick<PlannedSet,
    "setType" | "targetWeight" | "targetReps" | "targetDuration" | "targetDistance">

// PUT /api/workout-plans/:planId/days/:dayId/exercises
// Array position is the order: exercise i gets order i + 1, set j gets
// setNumber j + 1. The client never sends order, setNumber or row ids.
export interface SaveDayBody
{
    exercises: { exerciseId: string, restSeconds: number | null, sets: SetTargets[] }[],
}

export interface WorkoutSessionSet
{
    id: string,
    setType: SetType,
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
    // Best estimated one-rep max from earlier finished workouts.
    // null when there is none or the exercise type is not eligible.
    previousBest: number | null,
    sets: WorkoutSessionSet[],
}

// GET /api/workout-sessions/:sessionId
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

// S3 -> S5 contract ("Award function"): what award() returns inside the finish transaction.
export interface AwardResult
{
    xpGained: number,
    levelUp: boolean,
    unlocked: string[],
}

// POST /api/workout-sessions/:sessionId/finish
export interface FinishWorkoutResponse
{
    session: WorkoutSession,
    // null when the workout was already finished.
    award: AwardResult | null,
}
