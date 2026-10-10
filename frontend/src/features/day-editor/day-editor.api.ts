import type { DayDetail, DayExercise, SaveDayBody, SetTargets, SetType } from "./day-editor.types";

// FAKE-DATA: in-memory mock of /api/workout-plans/:planId/days/:dayId.
// State resets on every page reload.
//
// FAKE-DATA: scenarios by dayId
//   "push-day-1"  -> Push (day 1): bench press, push-up, plank
//   "pull-day-2"  -> Pull (day 2), same exercises
//   any other id  -> Push (day 1), same exercises
//   "legs-day-3"  -> Legs (day 3) with no exercises, like the plan page
//   "empty"       -> Push (day 1) with no exercises
//   "missing"     -> GET returns null, save rejects "Day not found"
//   "fail"        -> GET always rejects
//   "flaky"       -> the first save of a given body rejects, the same body
//                    succeeds when retried
// FAKE-DATA: on any day, a save with a target equal to 999 always rejects

const FAKE_DELAY_MS = 500
const MAX_EXERCISES = 20
const MAX_SETS = 1000
const SET_TYPES: SetType[] = ["NORMAL", "WARMUP", "DROP", "FAILURE"]

type CatalogExercise = DayExercise["exercise"]

// FAKE-DATA: stands in for the Exercise table.
const catalog = new Map<string, CatalogExercise>([
    ["bench-press", { id: "bench-press", name: "Barbell bench press", type: "WEIGHT_REPS", primaryMuscle: "Chest" }],
    ["push-up", { id: "push-up", name: "Push-up", type: "BODYWEIGHT_REPS", primaryMuscle: "Chest" }],
    ["plank", { id: "plank", name: "Plank", type: "DURATION", primaryMuscle: "Core" }],
    ["incline-dumbbell-press", { id: "incline-dumbbell-press", name: "Incline dumbbell press", type: "WEIGHT_REPS", primaryMuscle: "Chest" }],
    ["running", { id: "running", name: "Running", type: "DISTANCE_DURATION", primaryMuscle: "Cardio" }],
])

// FAKE-DATA: one entry per dayId, seeded on first access.
const days = new Map<string, DayDetail>()

// FAKE-DATA: "flaky" saves that have already failed once.
const flakyAttempts = new Set<string>()

function wait() {
    return new Promise(resolve => setTimeout(resolve, FAKE_DELAY_MS))
}

function normalSets(count: number, targets: Partial<SetTargets>): SetTargets[] {
    return Array.from({ length: count }, () => ({
        setType: "NORMAL",
        targetWeight: null,
        targetReps: null,
        targetDuration: null,
        targetDistance: null,
        ...targets,
    }))
}

function seedBody(): SaveDayBody {
    return {
        exercises: [
            { exerciseId: "bench-press", restSeconds: 90, sets: normalSets(3, { targetWeight: 60, targetReps: 8 }) },
            { exerciseId: "push-up", restSeconds: null, sets: normalSets(2, { targetReps: 15 }) },
            { exerciseId: "plank", restSeconds: 60, sets: normalSets(2, { targetDuration: 45 }) },
        ],
    }
}

const seededDays = new Map([
    ["pull-day-2", { name: "Pull", dayOrder: 2 }],
    ["legs-day-3", { name: "Legs", dayOrder: 3 }],
])

function findDay(planId: string, dayId: string): DayDetail | null {
    if (dayId === "missing") return null

    const stored = days.get(dayId)
    if (stored) return stored

    const { name, dayOrder } = seededDays.get(dayId) ?? { name: "Push", dayOrder: 1 }
    const hasNoExercises = dayId === "legs-day-3" || dayId === "empty"
    const day: DayDetail = {
        id: dayId,
        name,
        dayOrder,
        planId,
        planName: "Push Pull Legs",
        exercises: hasNoExercises ? [] : buildExercises(seedBody()),
    }
    days.set(dayId, day)
    return day
}

// Callers always receive copies, never the stored objects.
function copyDay(day: DayDetail): DayDetail {
    const exercises = [...day.exercises].sort((a, b) => a.order - b.order)
    return {
        ...day,
        exercises: exercises.map(e => ({
            ...e,
            exercise: { ...e.exercise },
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
        throw new Error(`A day can have ${MAX_EXERCISES} exercises max.`)

    for (const item of body.exercises) {
        if (!catalog.has(item.exerciseId))
            throw new Error("Unknown exercise.")
        if (item.restSeconds !== null && !isWholeBetween(item.restSeconds, 0, 3600))
            throw new Error("Rest must be between 0 and 3600 seconds.")
        if (item.sets.length > MAX_SETS)
            throw new Error(`An exercise can have ${MAX_SETS} sets max.`)
        item.sets.forEach(validateSet)
    }
}

function hasFailTrigger(body: SaveDayBody): boolean {
    return body.exercises.some(item => item.sets.some(set =>
        [set.targetWeight, set.targetReps, set.targetDuration, set.targetDistance].includes(999)))
}

function failFirstAttempt(dayId: string, requestKey: string) {
    if (dayId !== "flaky" || flakyAttempts.has(requestKey)) return
    flakyAttempts.add(requestKey)
    throw new Error("Failed to save, try again.")
}

// Mirrors the backend's delete-and-recreate: every row gets a new id, and
// only known fields are copied, so stray ids or order values are ignored.
// Call it only with a body that passed validateBody.
function buildExercises(body: SaveDayBody): DayExercise[] {
    return body.exercises.map((item, index) => ({
        id: crypto.randomUUID(),
        order: index + 1,
        restSeconds: item.restSeconds,
        exercise: { ...catalog.get(item.exerciseId)! },
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

// FAKE-DATA: real version will be GET /api/workout-plans/:planId/days/:dayId
export default async function getWorkoutDay(planId: string, dayId: string): Promise<DayDetail | null> {
    await wait()

    if (dayId === "fail")
        throw new Error("Failed to load day, try again.")

    const day = findDay(planId, dayId)
    if (!day) return null
    return copyDay(day)
}

// FAKE-DATA: real version will be PUT /api/workout-plans/:planId/days/:dayId/exercises
export async function saveWorkoutDay(planId: string, dayId: string, body: SaveDayBody): Promise<DayDetail> {
    await wait()

    const day = findDay(planId, dayId)
    if (!day) throw new Error("Day not found")
    validateBody(body)
    if (hasFailTrigger(body))
        throw new Error("Failed to save, try again.")
    failFirstAttempt(dayId, JSON.stringify(body))

    const savedDay: DayDetail = { ...day, exercises: buildExercises(body) }
    days.set(dayId, savedDay)
    return copyDay(savedDay)
}
