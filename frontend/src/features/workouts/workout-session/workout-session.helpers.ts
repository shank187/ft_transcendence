import { type ExerciseSummary, type WorkoutSessionExercise, type WorkoutSessionSet } from "../shared/workouts.types";

// The only places that copy the nested arrays: the changed exercise and set
// get new objects, every other one keeps its reference.
export function updateExercise(
    exercises: WorkoutSessionExercise[],
    exerciseId: string,
    change: (exercise: WorkoutSessionExercise) => WorkoutSessionExercise,
): WorkoutSessionExercise[]
{
    return exercises.map(exercise => exercise.id !== exerciseId ? exercise : change(exercise))
}

export function updateSet(
    exercises: WorkoutSessionExercise[],
    exerciseId: string,
    setId: string,
    change: (set: WorkoutSessionSet) => WorkoutSessionSet,
): WorkoutSessionExercise[]
{
    return updateExercise(exercises, exerciseId, exercise =>
        ({ ...exercise, sets: exercise.sets.map(set => set.id !== setId ? set : change(set)) }))
}

// Same Epley formula as finishWorkoutSession on the backend, so the live badge
// and the PR stored at finish agree.
export function estimateOneRepMax(weight: number, reps: number): number
{
    if (reps === 1)
        return weight
    return weight * (1 + reps / 30)
}

// Same rule as prScore on the backend: weight types score their estimated one-rep max,
// reps-only bodyweight scores its reps, every other type has no PR.
function prScore(type: ExerciseSummary["type"], set: WorkoutSessionSet): number | null
{
    if (set.reps === null)
        return null
    if (type === "BODYWEIGHT_REPS")
        return set.reps
    if ((type === "WEIGHT_REPS" || type === "WEIGHTED_BODYWEIGHT") && set.weight !== null)
        return estimateOneRepMax(set.weight, set.reps)
    return null
}

// The live PR badge, in three steps that mirror finishWorkoutSession on the backend.
type PrCandidate = { setId: string, exerciseId: string, score: number }

// Step 1: every ticked set that can be scored for its exercise type.
// exerciseId is the catalog exercise, so an exercise added twice is one exercise.
function tickedCandidates(exercises: WorkoutSessionExercise[]): PrCandidate[]
{
    return exercises.flatMap(exercise => exercise.sets.flatMap(set => {
        const score = set.completedAt === null ? null : prScore(exercise.exerciseSummary.type, set)
        return score === null ? [] : [{ setId: set.id, exerciseId: exercise.exerciseSummary.id, score }]
    }))
}

// Step 2: the highest score per exercise. On a tie the earlier set keeps it.
function bestPerExercise(candidates: PrCandidate[]): Map<string, PrCandidate>
{
    const best = new Map<string, PrCandidate>()
    for (const candidate of candidates)
    {
        const current = best.get(candidate.exerciseId)
        if (!current || candidate.score > current.score)
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
        if (previous !== undefined && best.score > previous)
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
