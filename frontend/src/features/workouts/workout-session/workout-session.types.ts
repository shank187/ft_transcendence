import type { SetType, WorkoutSessionSet, WorkoutSummary } from "../shared/workouts.types"
import type { FieldKey } from "../shared/exercise-fields"

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