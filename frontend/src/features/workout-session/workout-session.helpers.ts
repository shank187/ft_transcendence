import { toNumber } from "../day-editor/day-editor.draft";
import type { FieldKey } from "../day-editor/exercise-fields";
import type { PerformedValues, WorkoutSessionExercise, WorkoutSessionSet } from "./workout-session.types";

// Inputs hold text: a row starts from the server numbers, null shows as "".
export function toText(value: number | null): string
{
    return value !== null ? value.toString() : ""
}

// The way back on tick: "" becomes null, "80.5" becomes 80.5.
export function toPerformed(text: Record<FieldKey, string>): PerformedValues
{
    return {
        weight: toNumber(text.weight),
        reps: toNumber(text.reps),
        duration: toNumber(text.duration),
        distance: toNumber(text.distance),
    }
}

// The only place that copies the nested arrays: the changed exercise and set
// get new objects, every other one keeps its reference.
export function updateSet(
    exercises: WorkoutSessionExercise[],
    exerciseId: string,
    setId: string,
    change: (set: WorkoutSessionSet) => WorkoutSessionSet,
): WorkoutSessionExercise[]
{
    return exercises.map(exercise => exercise.id !== exerciseId
        ? exercise
        : { ...exercise, sets: exercise.sets.map(set => set.id !== setId ? set : change(set)) }
    )
}
