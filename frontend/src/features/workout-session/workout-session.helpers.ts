import { toNumber } from "../day-editor/day-editor.draft";
import type { FieldKey } from "../day-editor/exercise-fields";
import {type PerformedValues, type WorkoutSession, type WorkoutSessionExercise, type WorkoutSessionSet, type WorkoutSummary } from "./workout-session.types";

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

// Rebuilds the list in the order the server returned; ids it does not know are dropped.
export function orderExercises(exercises: WorkoutSessionExercise[], ids: string[]): WorkoutSessionExercise[]
{
    return ids
        .map(id => exercises.find(exercise => exercise.id === id))
        .filter(exercise => exercise !== undefined)
}

// 38:42 under an hour, 1:02:05 after.
export function formatElapsed(ms: number): string
{
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor(totalSeconds / 60) % 60
    const seconds = String(totalSeconds % 60).padStart(2, "0")
    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
        : `${minutes}:${seconds}`
}

// Volume only counts completed sets that have both a weight and reps.
// prSetIds stays empty: PRs are detected on the server.
export function buildSummary(session: WorkoutSession): WorkoutSummary
{
    const sets = session.exercises.flatMap(exercise => exercise.sets)
    const completed = sets.filter(set => set.completedAt !== null)
    const durationMs = session.completedAt
        ? new Date(session.completedAt).getTime() - new Date(session.startedAt).getTime()
        : 0
    return {
        durationSeconds: Math.max(0, Math.floor(durationMs / 1000)),
        setsCompleted: completed.length,
        setsTotal: sets.length,
        volumeKg: completed.reduce((total, set) =>
            set.weight !== null && set.reps !== null ? total + set.weight * set.reps : total, 0),
        exerciseCount: session.exercises.length,
        prSetIds: [],
    }
}
