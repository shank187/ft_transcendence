import getWorkoutDay from "../day-editor/day-editor.api";
import type { PlannedSet } from "../day-editor/day-editor.types";
import type { PerformedValues, WorkoutSession, WorkoutSessionSet } from "./workout-session.types";

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
//   completeSet, page URL ?fake=set-fail    -> always rejects

const FAKE_DELAY_MS = 500

// FAKE-DATA: stands in for the WorkoutSession table, one entry per session id.
const sessions = new Map<string, WorkoutSession>()

// FAKE-DATA: set once a "flaky" empty start has failed.
let emptyStartFailed = false

function wait() {
    return new Promise(resolve => setTimeout(resolve, FAKE_DELAY_MS))
}

// Callers always receive copies, never the stored objects.
function copySession(session: WorkoutSession): WorkoutSession {
    return {
        ...session,
        exercises: session.exercises.map(e => ({
            ...e,
            exerciseSummary: { ...e.exerciseSummary },
            sets: e.sets.map(s => ({ ...s })),
        })),
    }
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


// FAKE-DATA: real version will be PATCH /api/workout-sessions/:id/sets/:setId
// Returns the saved set; its completedAt comes from the server, not the client.
export async function completeSet(sessionId: string, setId: string, values: PerformedValues): Promise<WorkoutSessionSet> {
    await wait()
    if (new URLSearchParams(window.location.search).get("fake") === "set-fail")
        throw new Error("Failed to save set, try again.")

    const session = sessions.get(sessionId)
    if (!session || session.status !== "IN_PROGRESS") throw new Error("Workout not found")
    const set = session.exercises.flatMap(e => e.sets).find(s => s.id === setId)
    if (!set) throw new Error("Set not found")

    const saved: WorkoutSessionSet = { ...set, ...values, completedAt: new Date().toISOString() }
    sessions.set(sessionId, {
        ...session,
        exercises: session.exercises.map(e => ({ ...e, sets: e.sets.map(s => s.id === setId ? saved : s) })),
    })
    return { ...saved }
}
