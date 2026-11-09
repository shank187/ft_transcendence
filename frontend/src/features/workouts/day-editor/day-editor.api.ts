import type { DayDetail, DayExercise, SaveDayBody, SetTargets } from "./day-editor.types";
import type { ExerciseSummary, SetType } from "../shared/workouts.types";
import { getPlanDetails } from "../shared/get-plan-details";
import { MAX_EXERCISES, MAX_SETS_PER_EXERCISE } from "../shared/limits";

// The day's name, order and plan name come from the real
// GET /api/workout-plans/:planId. Only its exercises are still fake.
//
// FAKE-DATA: the exercises live in memory, one list per dayId, empty at first,
// and reset on every page reload.
// FAKE-DATA: a save with a target equal to 999 always rejects.

const FAKE_DELAY_MS = 500
const SET_TYPES: SetType[] = ["NORMAL", "WARMUP", "DROP", "FAILURE"]

// FAKE-DATA: the exercises the picker added, so the fake save can rebuild
// their summary from an id. Remove with the real day API (Phase 2).
const catalog = new Map<string, ExerciseSummary>()

export function rememberFakeExercises(summaries: ExerciseSummary[]) {
    for (const summary of summaries) catalog.set(summary.id, summary)
}

// FAKE-DATA: the saved exercises, one entry per dayId.
const savedExercises = new Map<string, DayExercise[]>()

function wait() {
    return new Promise(resolve => setTimeout(resolve, FAKE_DELAY_MS))
}

// Callers always receive copies, never the stored objects.
function copyDay(day: DayDetail): DayDetail {
    const exercises = [...day.exercises].sort((a, b) => a.order - b.order)
    return {
        ...day,
        exercises: exercises.map(e => ({
            ...e,
            exerciseSummary: { ...e.exerciseSummary },
            sets: [...e.sets].sort((a, b) => a.setNumber - b.setNumber).map(s => ({ ...s })),
        })),
    }
}

function isWholeBetween(value: number, min: number, max: number): boolean {
    return Number.isInteger(value) && value >= min && value <= max
}

function isDecimalBetween(value: number, min: number, max: number, decimals: number): boolean {
    return Number.isFinite(value) && value >= min && value <= max
        && Number(value.toFixed(decimals)) === value
}

// null means "no target". A missing key arrives as undefined and is rejected.
function validateSet(set: SetTargets) {
    const { setType, targetWeight, targetReps, targetDuration, targetDistance } = set

    if (!SET_TYPES.includes(setType))
        throw new Error("Invalid set type.")
    if (targetWeight !== null && !isDecimalBetween(targetWeight, 0, 1000, 2))
        throw new Error("Weight must be between 0 and 1000 kg.")
    if (targetReps !== null && !isWholeBetween(targetReps, 1, 999))
        throw new Error("Reps must be a whole number between 1 and 999.")
    if (targetDuration !== null && !isWholeBetween(targetDuration, 1, 86400))
        throw new Error("Time must be a whole number of seconds, 1 to 86400.")
    if (targetDistance !== null && (targetDistance <= 0 || !isDecimalBetween(targetDistance, 0, 1000000, 1)))
        throw new Error("Distance must be between 0 and 1000000 m.")
}

function validateBody(body: SaveDayBody) {
    if (body.exercises.length > MAX_EXERCISES)
        throw new Error(`A day can have at most ${MAX_EXERCISES} exercises.`)

    for (const item of body.exercises) {
        if (!catalog.has(item.exerciseId))
            throw new Error("Unknown exercise.")
        if (item.restSeconds !== null && !isWholeBetween(item.restSeconds, 0, 3600))
            throw new Error("Rest must be between 0 and 3600 seconds.")
        if (item.sets.length > MAX_SETS_PER_EXERCISE)
            throw new Error(`An exercise can have at most ${MAX_SETS_PER_EXERCISE} sets.`)
        item.sets.forEach(validateSet)
    }
}

// FAKE-DATA: a target equal to 999 makes the fake save reject.
function hasFailTrigger(body: SaveDayBody): boolean {
    return body.exercises.some(item => item.sets.some(set =>
        [set.targetWeight, set.targetReps, set.targetDuration, set.targetDistance].includes(999)))
}

// Mirrors the backend's delete-and-recreate: every row gets a new id, and
// only known fields are copied, so stray ids or order values are ignored.
// Call it only with a body that passed validateBody.
function buildExercises(body: SaveDayBody): DayExercise[] {
    return body.exercises.map((item, index) => ({
        id: crypto.randomUUID(),
        order: index + 1,
        restSeconds: item.restSeconds,
        exerciseSummary: { ...catalog.get(item.exerciseId)! },
        sets: item.sets.map((set, setIndex) => ({
            id: crypto.randomUUID(),
            setNumber: setIndex + 1,
            setType: set.setType,
            targetWeight: set.targetWeight,
            targetReps: set.targetReps,
            targetDuration: set.targetDuration,
            targetDistance: set.targetDistance,
        })),
    }))
}

// null when the plan is not the user's or the day is not in it.
// Errors come from getPlanDetails, already readable.
async function findDay(planId: string, dayId: string): Promise<DayDetail | null> {
    const plan = await getPlanDetails(planId)
    const day = plan?.days.find(d => d.id === dayId)
    if (!plan || !day) return null
    return {
        id: day.id,
        name: day.name,
        dayOrder: day.dayOrder,
        planId: plan.id,
        planName: plan.name,
        exercises: savedExercises.get(dayId) ?? [],
    }
}

// FAKE-DATA: real version will be GET /api/workout-plans/:planId/days/:dayId
export default async function getWorkoutDay(planId: string, dayId: string): Promise<DayDetail | null> {
    const day = await findDay(planId, dayId)
    return day ? copyDay(day) : null
}

// FAKE-DATA: real version will be PUT /api/workout-plans/:planId/days/:dayId/exercises
export async function saveWorkoutDay(planId: string, dayId: string, body: SaveDayBody): Promise<DayDetail> {
    const day = await findDay(planId, dayId)
    if (!day) throw new Error("Day not found")
    await wait()
    validateBody(body)
    if (hasFailTrigger(body))
        throw new Error("Failed to save, try again.")

    const exercises = buildExercises(body)
    savedExercises.set(dayId, exercises)
    return copyDay({ ...day, exercises })
}
