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

// The live PR badge, in three steps that mirror finishWorkoutSession on the backend.
type PrCandidate = { setId: string, exerciseId: string, estimate: number }

// Step 1: every ticked set that has a weight and reps, with its estimated one-rep max.
// exerciseId is the catalog exercise, so an exercise added twice is one exercise.
function tickedCandidates(exercises: WorkoutSessionExercise[]): PrCandidate[]
{
    return exercises.flatMap(exercise => exercise.sets.flatMap(set =>
        set.completedAt === null || set.weight === null || set.reps === null
            ? []
            : [{
                setId: set.id,
                exerciseId: exercise.exerciseSummary.id,
                estimate: estimateOneRepMax(set.weight, set.reps),
            }]
    ))
}

// Step 2: the highest estimate per exercise. On a tie the earlier set keeps it.
function bestPerExercise(candidates: PrCandidate[]): Map<string, PrCandidate>
{
    const best = new Map<string, PrCandidate>()
    for (const candidate of candidates)
    {
        const current = best.get(candidate.exerciseId)
        if (!current || candidate.estimate > current.estimate)
            best.set(candidate.exerciseId, candidate)
    }
    return best
}

// Step 3: today's best is a PR when it beats the best from earlier finished workouts.
// previousBest is null for a first time and for types that can't have a PR, so those never match.
export function livePrSetIds(exercises: WorkoutSessionExercise[]): Set<string>
{
    const previousBest = new Map<string, number>()
    for (const exercise of exercises)
    {
        if (exercise.previousBest !== null)
            previousBest.set(exercise.exerciseSummary.id, exercise.previousBest)
    }
    const prSetIds = new Set<string>()
    for (const [exerciseId, best] of bestPerExercise(tickedCandidates(exercises)))
    {
        const previous = previousBest.get(exerciseId)
        if (previous !== undefined && best.estimate > previous)
            prSetIds.add(best.setId)
    }
    return prSetIds
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
