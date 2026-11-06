import type { ExerciseSummary, SetType } from "../day-editor/day-editor.types"
import type { FieldKey } from "../day-editor/exercise-fields"

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

// S3 -> S5 contract ("Award function"): what award() returns inside the finish transaction.
export interface AwardResult {
    xpGained: number,
    levelUp: boolean,
    unlocked: string[],
}

// POST /api/workout-sessions/:id/finish. The award comes only from this
// response, so XP is shown once and not after a reload.
export interface FinishResult {
    summary: WorkoutSummary,
    award: AwardResult,
}

// What the user did in one set, sent when the set is ticked.
export type PerformedValues = Pick<WorkoutSessionSet, FieldKey>

// request bodies

// PATCH /api/workout-sessions/:sessionId/sets/:setId. Every field is optional:
// only the ones present change, and null clears a value.
export interface SetPatch {
    weight?: number | null,
    reps?: number | null,
    duration?: number | null,
    distance?: number | null,
    setType?: SetType,
    completed?: boolean,
}

type PlannedKey = "plannedWeight" | "plannedReps" | "plannedDuration" | "plannedDistance"

export const PLANNED_KEY: Record<FieldKey, PlannedKey> = {
    weight: "plannedWeight",
    reps : "plannedReps",
    duration: "plannedDuration",
    distance: "plannedDistance"
}