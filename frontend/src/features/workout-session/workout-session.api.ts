import getWorkoutDay from "../day-editor/day-editor.api";
import type { ExerciseSummary, PlannedSet, SetType } from "../day-editor/day-editor.types";
import type { AwardResult, FinishResult, SetPatch, WorkoutSession, WorkoutSessionExercise, WorkoutSessionSet, WorkoutSummary } from "./workout-session.types";
import { buildSummary } from "./workout-session.helpers";

// FAKE-DATA: mock of /api/workout-sessions.
// Sessions are kept in localStorage so a reload keeps them, like the real
// database. Remove the "fake-workout-sessions" key to start clean.
//
// FAKE-DATA: scenarios
//   startWorkoutFromDay, a day not in the user's plan -> rejects "Day not found"
//   (the day itself comes from getWorkoutDay, which reads the real plan)
//   getWorkoutSession, id "missing"      -> returns null
//   getWorkoutSession, id "fail"         -> rejects
//   startEmptyWorkout, page URL ?fake=fail  -> always rejects
//   startEmptyWorkout / startWorkoutFromDay while a session is IN_PROGRESS
//                                        -> rejects ActiveWorkoutError
//   startEmptyWorkout, page URL ?fake=flaky -> the first call rejects, the
//                                              retry succeeds (until reload)
//   page URL ?fake=save-fail -> updateSessionSet, addSet, deleteSet,
//                               addExercises and moveExercise always reject
//   page URL ?fake=levelup -> the first finishWorkout returns levelUp: true
//                             and unlocked: ["WORKOUTS_1"]
//   addExercises only knows exercises from a started day or passed to
//   rememberFakeExercises; any other id rejects "Exercise not found"

const FAKE_DELAY_MS = 500
const MAX_EXERCISES = 20
const SET_TYPES: SetType[] = ["NORMAL", "WARMUP", "DROP", "FAILURE"]

// FAKE-DATA: stands in for the WorkoutSession table, one entry per session id.
const STORAGE_KEY = "fake-workout-sessions"
const sessions = loadStoredSessions()

// Storage can be blocked or hold old shapes; then the fake starts empty.
function loadStoredSessions(): Map<string, WorkoutSession> {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as WorkoutSession[]
        return new Map(stored.map(session => [session.id, session]))
    } catch {
        return new Map()
    }
}

function storeSession(session: WorkoutSession) {
    sessions.set(session.id, session)
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...sessions.values()]))
    } catch {
        // The in-memory copy still works for this page load.
    }
}

// FAKE-DATA: stands in for the Exercise table, so addExercises can build a
// summary from an id. Filled by started days and rememberFakeExercises.
const catalog = new Map<string, ExerciseSummary>()

// FAKE-DATA: the picker adds real catalog exercises; remember them so addExercises can find their summary. Remove with the real session API (Phase 2).
export function rememberSessionExercises(summaries: ExerciseSummary[]) {
    for (const summary of summaries) catalog.set(summary.id, summary)
}

// Only one workout can be in progress. The real API answers 409 with the
// active session id; callers offer to resume it or discard it.
export class ActiveWorkoutError extends Error {
    activeSessionId: string
    constructor(activeSessionId: string) {
        super("You have a workout in progress.")
        this.name = "ActiveWorkoutError"
        this.activeSessionId = activeSessionId
    }
}

// FAKE-DATA: stands in for the server's one-active-workout check.
function failIfActive() {
    for (const session of sessions.values())
        if (session.status === "IN_PROGRESS") throw new ActiveWorkoutError(session.id)
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
    failIfActive()

    const session: WorkoutSession = {
        id: crypto.randomUUID(),
        name: "Empty workout",
        workoutDayId: null,
        status: "IN_PROGRESS",
        startedAt: new Date().toISOString(),
        completedAt: null,
        bodyWeightKg: null,
        exercises: [],
        summary: null,
    }
    storeSession(session)
    return copySession(session)
}

// FAKE-DATA: real version will be POST /api/workout-sessions with the dayId.
// getWorkoutDay makes a real request, so there is no fake wait here.
export async function startWorkoutFromDay(planId: string, dayId: string): Promise<WorkoutSession> {
    const day = await getWorkoutDay(planId, dayId)
    if (!day) throw new Error("Day not found")
    failIfActive()
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
        summary: null,
    }
    storeSession(session)
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
    return { ...copySession(session), summary: session.status === "COMPLETED" ? fakeSummary(session) : null }
}

// FAKE-DATA: real version will be PATCH /api/workout-sessions/:id
export async function discardWorkout(id: string): Promise<void> {
    await wait()
    const session = sessions.get(id)
    if (!session) throw new Error("Workout not found")
    storeSession({ ...session, status: "CANCELLED" })
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
    storeSession({ ...session, exercises })
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


// FAKE-DATA: PR detection is server-side (WorkoutSet.isPr), so prSetIds stays empty here.
function fakeSummary(session: WorkoutSession): WorkoutSummary {
    return buildSummary(session)
}

const NO_AWARD: AwardResult = { xpGained: 0, levelUp: false, unlocked: [] }

// FAKE-DATA: real version will be POST /api/workout-sessions/:id/finish
// Safe to repeat: finishing a COMPLETED workout returns the same summary and never pays twice.
export async function finishWorkout(id: string): Promise<FinishResult> {
    await wait()
    const session = sessions.get(id)
    if (!session) throw new Error("Workout not found")
    if (session.status === "CANCELLED") throw new Error("This workout was discarded.")
    if (session.status === "COMPLETED") return { summary: fakeSummary(session), award: { ...NO_AWARD, unlocked: [] } }
    const done = session.exercises.some(e => e.sets.some(s => s.completedAt !== null))
    if (!done) throw new Error("Complete at least one set to finish.")

    const finished: WorkoutSession = { ...session, status: "COMPLETED", completedAt: new Date().toISOString() }
    storeSession(finished)
    const summary = fakeSummary(finished)
    const levelUp = new URLSearchParams(window.location.search).get("fake") === "levelup"
    // FAKE-DATA: the real values come from S5's award(tx, userId, events) inside the finish transaction.
    const award: AwardResult = {
        xpGained: 100 + 50 * summary.prSetIds.length,
        levelUp,
        unlocked: levelUp ? ["WORKOUTS_1"] : [],
    }
    return { summary, award }
}
