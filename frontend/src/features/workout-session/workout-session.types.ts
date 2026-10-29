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
}

// What the user did in one set, sent when the set is ticked.
export type PerformedValues = Pick<WorkoutSessionSet, FieldKey>