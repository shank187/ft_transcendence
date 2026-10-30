import getWorkoutDay from "../day-editor/day-editor.api";
import type { ExerciseSummary, PlannedSet, SetType } from "../day-editor/day-editor.types";
import type { SetPatch, WorkoutSession, WorkoutSessionExercise, WorkoutSessionSet } from "./workout-session.types";

// FAKE-DATA: in-memory mock of /api/workout-sessions.
// State resets on every page reload.
//
// FAKE-DATA: scenarios
//   startWorkoutFromDay, dayId "fail"    -> rejects (from getWorkoutDay)
//   startWorkoutFromDay, dayId "missing" -> rejects "Day not found"
//   getWorkoutSession, id "missing"      -> returns null
//   getWorkoutSession, id "fail"         -> rejects
//   startEmptyWorkout, page URL ?fake=fail  -> always rejects
//   startEmptyWorkout, page URL ?fake=flaky -> the first call rejects, the
//                                              retry succeeds (until reload)
//   page URL ?fake=save-fail -> updateSessionSet, addSet, deleteSet,
//                               addExercises and moveExercise always reject
//   addExercises only knows exercises from a started day or passed to
//   rememberFakeExercises; any other id rejects "Exercise not found"

const FAKE_DELAY_MS = 500
const MAX_EXERCISES = 20
const SET_TYPES: SetType[] = ["NORMAL", "WARMUP", "DROP", "FAILURE"]

// FAKE-DATA: stands in for the WorkoutSession table, one entry per session id.
const sessions = new Map<string, WorkoutSession>()

// FAKE-DATA: stands in for the Exercise table, so addExercises can build a
// summary from an id. Filled by started days and rememberFakeExercises.
const catalog = new Map<string, ExerciseSummary>()

// FAKE-DATA: the picker adds real catalog exercises; remember them so addExercises can find their summary. Remove with the real session API (Phase 2).
export function rememberSessionExercises(summaries: ExerciseSummary[]) {
    for (const summary of summaries) catalog.set(summary.id, summary)
}

// FAKE-DATA: set once a "flaky" empty start has failed.
let emptyStartFailed = false

function wait() {
    return new Promise(resolve => setTimeout(resolve, FAKE_DELAY_MS))
}

// Callers always receive copies, never the stored objects.
function copyExercise(exercise: WorkoutSessionExercise): WorkoutSessionExercise {
    return {
        ...exercise,
        exerciseSummary: { ...exercise.exerciseSummary },
        sets: exercise.sets.map(s => ({ ...s })),
    }
}

function copySession(session: WorkoutSession): WorkoutSession {
    return { ...session, exercises: session.exercises.map(copyExercise) }
}

function toSessionSet(planned: PlannedSet): WorkoutSessionSet {
    return {
        id: crypto.randomUUID(),
        setType: planned.setType,
        setNumber: planned.setNumber,
        plannedWeight: planned.targetWeight,
        plannedReps: planned.targetReps,
        plannedDuration: planned.targetDuration,
        plannedDistance: planned.targetDistance,
        weight: null,
        reps: null,
        duration: null,
        distance: null,
        completedAt: null,
    }
}

// FAKE-DATA: startEmptyWorkout takes no id to pick a scenario from, so it
// reads ?fake= from the page URL instead.
function failEmptyStart() {
    const scenario = new URLSearchParams(window.location.search).get("fake")
    if (scenario === "fail")
        throw new Error("Failed to start workout, try again.")
    if (scenario === "flaky" && !emptyStartFailed) {
        emptyStartFailed = true
        throw new Error("Failed to start workout, try again.")
    }
}

// FAKE-DATA: real version will be POST /api/workout-sessions
export async function startEmptyWorkout(): Promise<WorkoutSession> {
    await wait()
    failEmptyStart()

    const session: WorkoutSession = {
        id: crypto.randomUUID(),
        name: "Empty workout",
        workoutDayId: null,
        status: "IN_PROGRESS",
        startedAt: new Date().toISOString(),
        completedAt: null,
        bodyWeightKg: null,
        exercises: [],
    }
    sessions.set(session.id, session)
    return copySession(session)
}

// FAKE-DATA: real version will be POST /api/workout-sessions with the dayId.
// getWorkoutDay already waits FAKE_DELAY_MS, so there is no extra wait here.
export async function startWorkoutFromDay(planId: string, dayId: string): Promise<WorkoutSession> {
    const day = await getWorkoutDay(planId, dayId)
    if (!day) throw new Error("Day not found")
    rememberSessionExercises(day.exercises.map(e => e.exerciseSummary))
    const session: WorkoutSession = {
        id: crypto.randomUUID(),
        name: day.name,
        workoutDayId: day.id,
        status: "IN_PROGRESS",
        startedAt: new Date().toISOString(),
        completedAt: null,
        bodyWeightKg: null,
        exercises: day.exercises.map(e => ({
            id: crypto.randomUUID(),
            order: e.order,
            exerciseSummary: { ...e.exerciseSummary },
            restSeconds: e.restSeconds,
            sets: e.sets.map(toSessionSet),
        })),
    }
    sessions.set(session.id, session)
    return copySession(session)
}

// FAKE-DATA: real version will be GET /api/workout-sessions/:id
// Reads only the stored session, never the day it was started from.
export async function getWorkoutSession(id: string): Promise<WorkoutSession | null> {
    await wait()
    if (id === "fail")
        throw new Error("Failed to load workout, try again.")
    if (id === "missing") return null

    const session = sessions.get(id)
    if (!session) return null
    return copySession(session)
}

// FAKE-DATA: real version will be PATCH /api/workout-sessions/:id
export async function discardWorkout(id: string): Promise<void> {
    await wait()

    const session = sessions.get(id)
    if (!session) throw new Error("Workout not found")
    sessions.set(id, { ...session, status: "CANCELLED" })
}


// FAKE-DATA: ?fake=save-fail makes every write below reject.
function failSave() {
    if (new URLSearchParams(window.location.search).get("fake") === "save-fail")
        throw new Error("Failed to save, try again.")
}

// Every write below needs a workout that exists and is still running.
function getOpenSession(sessionId: string): WorkoutSession {
    const session = sessions.get(sessionId)
    if (!session) throw new Error("Workout not found")
    if (session.status !== "IN_PROGRESS") throw new Error("This workout is finished or cancelled.")
    return session
}

function saveExercises(session: WorkoutSession, exercises: WorkoutSessionExercise[]) {
    sessions.set(session.id, { ...session, exercises })
}

function emptySet(setNumber: number): WorkoutSessionSet {
    return {
        id: crypto.randomUUID(),
        setType: "NORMAL",
        setNumber,
        plannedWeight: null,
        plannedReps: null,
        plannedDuration: null,
        plannedDistance: null,
        weight: null,
        reps: null,
        duration: null,
        distance: null,
        completedAt: null,
    }
}

// A field missing from the patch keeps its value; null is a real value (clears it).
function patched<T>(value: T | undefined, current: T): T {
    return value !== undefined ? value : current
}

function validatePatch(patch: SetPatch) {
    for (const key of ["weight", "reps", "duration", "distance"] as const) {
        const value = patch[key]
        if (value !== undefined && value !== null && (!Number.isFinite(value) || value < 0))
            throw new Error(`${key} must be a number of 0 or more.`)
    }
    if (patch.setType !== undefined && !SET_TYPES.includes(patch.setType))
        throw new Error("Unknown set type.")
}

// completed: true keeps the first completedAt, so ticking twice does not move it.
function nextCompletedAt(completed: boolean | undefined, current: string | null): string | null {
    if (completed === undefined) return current
    if (!completed) return null
    return current ?? new Date().toISOString()
}

// FAKE-DATA: real version will be PATCH /api/workout-sessions/:sessionId/sets/:setId
// Only the fields present in the patch change. Returns the saved set.
export async function updateSessionSet(sessionId: string, setId: string, patch: SetPatch): Promise<WorkoutSessionSet> {
    await wait()
    failSave()
    const session = getOpenSession(sessionId)
    const set = session.exercises.flatMap(e => e.sets).find(s => s.id === setId)
    if (!set) throw new Error("Set not found")
    validatePatch(patch)

    const saved: WorkoutSessionSet = {
        ...set,
        weight: patched(patch.weight, set.weight),
        reps: patched(patch.reps, set.reps),
        duration: patched(patch.duration, set.duration),
        distance: patched(patch.distance, set.distance),
        setType: patched(patch.setType, set.setType),
        completedAt: nextCompletedAt(patch.completed, set.completedAt),
    }
    saveExercises(session, session.exercises.map(e => ({ ...e, sets: e.sets.map(s => s.id === setId ? saved : s) })))
    return { ...saved }
}

// FAKE-DATA: real version will be POST /api/workout-sessions/:sessionId/exercises/:exerciseId/sets
export async function addSet(sessionId: string, exerciseId: string): Promise<WorkoutSessionSet> {
    await wait()
    failSave()
    const session = getOpenSession(sessionId)
    const exercise = session.exercises.find(e => e.id === exerciseId)
    if (!exercise) throw new Error("Exercise not found")

    const set = emptySet(Math.max(0, ...exercise.sets.map(s => s.setNumber)) + 1)
    saveExercises(session, session.exercises.map(e => e.id === exerciseId ? { ...e, sets: [...e.sets, set] } : e))
    return { ...set }
}

// FAKE-DATA: real version will be DELETE /api/workout-sessions/:sessionId/sets/:setId
// Ticked sets can be deleted too. The remaining sets are renumbered 1..n.
export async function deleteSet(sessionId: string, setId: string): Promise<void> {
    await wait()
    failSave()
    const session = getOpenSession(sessionId)
    const exercise = session.exercises.find(e => e.sets.some(s => s.id === setId))
    if (!exercise) throw new Error("Set not found")

    const sets = exercise.sets
        .filter(s => s.id !== setId)
        .map((s, i) => ({ ...s, setNumber: i + 1 }))
    saveExercises(session, session.exercises.map(e => e.id === exercise.id ? { ...e, sets } : e))
}

// FAKE-DATA: real version will be POST /api/workout-sessions/:sessionId/exercises
// All or none: one bad id and nothing is added. Returns the new exercises.
export async function addExercises(sessionId: string, exerciseIds: string[]): Promise<WorkoutSessionExercise[]> {
    await wait()
    failSave()
    const session = getOpenSession(sessionId)
    if (exerciseIds.length === 0) throw new Error("Pick at least one exercise.")
    if (session.exercises.length + exerciseIds.length > MAX_EXERCISES)
        throw new Error(`A workout can have at most ${MAX_EXERCISES} exercises.`)
    const summaries = exerciseIds.map(id => catalog.get(id))
    if (summaries.some(summary => summary === undefined)) throw new Error("Exercise not found")

    const nextOrder = Math.max(0, ...session.exercises.map(e => e.order)) + 1
    const added = summaries.map((summary, i): WorkoutSessionExercise => ({
        id: crypto.randomUUID(),
        order: nextOrder + i,
        exerciseSummary: { ...summary! },
        restSeconds: null,
        sets: [emptySet(1)],
    }))
    saveExercises(session, [...session.exercises, ...added])
    return added.map(copyExercise)
}

// FAKE-DATA: real version will be PATCH /api/workout-sessions/:sessionId/exercises/:exerciseId
// Swaps order with the neighbour. Returns the exercise ids in their new order.
export async function moveExercise(sessionId: string, exerciseId: string, direction: -1 | 1): Promise<string[]> {
    await wait()
    failSave()
    const session = getOpenSession(sessionId)
    const exercises = [...session.exercises].sort((a, b) => a.order - b.order)
    const index = exercises.findIndex(e => e.id === exerciseId)
    if (index === -1) throw new Error("Exercise not found")
    const target = index + direction
    if (target < 0) throw new Error("This exercise is already first.")
    if (target >= exercises.length) throw new Error("This exercise is already last.")

    const current = exercises[index]
    const neighbour = exercises[target]
    exercises[index] = { ...neighbour, order: current.order }
    exercises[target] = { ...current, order: neighbour.order }
    saveExercises(session, exercises)
    return exercises.map(e => e.id)
}
