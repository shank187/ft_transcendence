import getWorkoutDay from "../day-editor/day-editor.api"; // FAKE-DATA: goes away with POST /api/workout-sessions { dayId }
import type { PlannedSet, WorkoutSession, WorkoutSessionSet } from "./workouts.types";
import { copySession, rememberSessionExercises, sessions, storeSession, wait } from "./fake-sessions";

// FAKE-DATA: part of the fake /api/workout-sessions; its scenarios are listed in
// workout-session/workout-session.api.ts.

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

// FAKE-DATA: real version will be PATCH /api/workout-sessions/:id
export async function discardWorkout(id: string): Promise<void> {
    await wait()
    const session = sessions.get(id)
    if (!session) throw new Error("Workout not found")
    storeSession({ ...session, status: "CANCELLED" })
}
