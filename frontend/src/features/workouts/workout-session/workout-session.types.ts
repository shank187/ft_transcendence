import type { SetType, WorkoutSessionSet } from "../shared/workouts.types"
import type { FieldKey } from "../shared/set-values"

// What the user did in one set, sent when the set is ticked.
export type PerformedValues = Pick<WorkoutSessionSet, FieldKey>

// PATCH /api/workout-sessions/:sessionId/sets/:setId. Every field is optional:
// only the ones present change, and null clears a value.
export interface SetPatch extends Partial<PerformedValues> {
    setType?: SetType,
    completed?: boolean,
}
