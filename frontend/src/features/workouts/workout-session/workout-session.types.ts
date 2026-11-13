import type { SetType, WorkoutSessionSet } from "../shared/workouts.types"
import type { FieldKey } from "../shared/exercise-fields"

// What the user did in one set, sent when the set is ticked.
export type PerformedValues = Pick<WorkoutSessionSet, FieldKey>

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