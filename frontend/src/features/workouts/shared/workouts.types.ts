import type { ExerciseType } from "./exercise-picker/exercise.types"

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

export interface WorkoutPlanInput
{
    name: string,
    description: string | null,
}

// Same values as the WorkoutSetType enum in backend/prisma/schema.prisma.
export type SetType = "NORMAL" | "HEAVY" | "WARMUP" | "DROP" | "FAILURE"

export interface PlannedSet {            // WorkoutExerciseSet
    id: string
    setNumber: number
    setType: SetType
    targetWeight: number | null
    targetReps: number | null
    targetDuration: number | null
    targetDistance: number | null
}

export interface ExerciseSummary {
    id: string
    name: string
    type: ExerciseType
    primaryMuscle: string
    imageUrl: string | null
}

export  type WorkoutStatus = "IN_PROGRESS" | "COMPLETED" | "CANCELLED"

export interface WorkoutSessionSet {
    id: string,
    
    setType: SetType,
    setNumber: number,

    plannedWeight : number | null,
    plannedReps : number | null,
    plannedDuration : number | null,
    plannedDistance : number | null,

    weight : number | null,
    reps : number | null,
    duration : number | null,
    distance : number | null,
    
    completedAt : string | null,
}

export interface WorkoutSessionExercise{
    id: string,

    order: number,
    exerciseSummary: ExerciseSummary,
    restSeconds: number | null,
    sets: WorkoutSessionSet[],
}

export interface WorkoutSession {
    id: string,
    name: string,
    workoutDayId: string | null,
    status: WorkoutStatus,
    startedAt: string,
    completedAt: string | null,
    bodyWeightKg: number | null,
    exercises: WorkoutSessionExercise[],
    // Only a COMPLETED session has one.
    summary: WorkoutSummary | null,
}

// S3 -> S5 contract ("Workout results").
export interface WorkoutSummary {
    durationSeconds: number,
    setsCompleted: number,
    setsTotal: number,
    volumeKg: number,
    exerciseCount: number,
    prSetIds: string[],
}
