import { toNumber } from "../shared/set-values";
import type { FieldKey } from "../shared/exercise-fields";
import { type PerformedValues } from "./workout-session.types";
import { type WorkoutSessionExercise, type WorkoutSessionSet } from "../shared/workouts.types";

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

// Same Epley formula as finishWorkoutSession on the backend, so the live badge
// and the PR stored at finish agree.
export function estimateOneRepMax(weight: number, reps: number): number
{
    if (reps === 1)
        return weight
    return weight * (1 + reps / 30)
}

// The sets that would be PRs if the workout finished now: per exercise, the best ticked set,
// when it beats previousBest. previousBest is null for the types that can't have a PR,
// so the type is not checked here.
export function livePrSetIds(exercises: WorkoutSessionExercise[]): Set<string>
{
    // Keyed by the catalog exercise, like the backend: an exercise added twice still gets one PR.
    const best = new Map<string, { setId: string, estimate: number }>()
    for (const exercise of exercises)
    {
        if (exercise.previousBest === null)
            continue
        for (const set of exercise.sets)
        {
            if (set.completedAt === null || set.weight === null || set.reps === null)
                continue
            const estimate = estimateOneRepMax(set.weight, set.reps)
            const current = best.get(exercise.exerciseSummary.id)
            if (estimate > exercise.previousBest && (!current || estimate > current.estimate))
                best.set(exercise.exerciseSummary.id, { setId: set.id, estimate })
        }
    }
    return new Set([...best.values()].map(entry => entry.setId))
}

// Rebuilds the list in the order the server returned; ids it does not know are dropped.
// The existing order values are handed out again in that sequence, the same swap the server makes.
export function orderExercises(exercises: WorkoutSessionExercise[], ids: string[]): WorkoutSessionExercise[]
{
    const orders = exercises.map(exercise => exercise.order).sort((a, b) => a - b)
    return ids
        .map(id => exercises.find(exercise => exercise.id === id))
        .filter(exercise => exercise !== undefined)
        .map((exercise, i) => exercise.order === orders[i] ? exercise : { ...exercise, order: orders[i] })
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
