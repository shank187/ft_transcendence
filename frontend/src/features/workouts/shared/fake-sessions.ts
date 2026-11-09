import type { ExerciseSummary, WorkoutSession, WorkoutSessionExercise } from "./workouts.types";

// FAKE-DATA: the store behind the fake /api/workout-sessions, used by start-workout.ts
// and workout-session/workout-session.api.ts (its scenarios are listed there).

const FAKE_DELAY_MS = 500

// FAKE-DATA: stands in for the WorkoutSession table, one entry per session id.
const STORAGE_KEY = "fake-workout-sessions"
export const sessions = loadStoredSessions()

// Storage can be blocked or hold old shapes; then the fake starts empty.
function loadStoredSessions(): Map<string, WorkoutSession> {
    try {
        const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as WorkoutSession[]
        return new Map(stored.map(session => [session.id, session]))
    } catch {
        return new Map()
    }
}

export function storeSession(session: WorkoutSession) {
    sessions.set(session.id, session)
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify([...sessions.values()]))
    } catch {
        // The in-memory copy still works for this page load.
    }
}

// FAKE-DATA: stands in for the Exercise table, so addExercises can build a
// summary from an id. Filled by started days and rememberFakeExercises.
export const catalog = new Map<string, ExerciseSummary>()

// FAKE-DATA: the picker adds real catalog exercises; remember them so addExercises can find their summary. Remove with the real session API (Phase 2).
export function rememberSessionExercises(summaries: ExerciseSummary[]) {
    for (const summary of summaries) catalog.set(summary.id, summary)
}

export function wait() {
    return new Promise(resolve => setTimeout(resolve, FAKE_DELAY_MS))
}

// Callers always receive copies, never the stored objects.
export function copyExercise(exercise: WorkoutSessionExercise): WorkoutSessionExercise {
    return {
        ...exercise,
        exerciseSummary: { ...exercise.exerciseSummary },
        sets: exercise.sets.map(s => ({ ...s })),
    }
}

export function copySession(session: WorkoutSession): WorkoutSession {
    return { ...session, exercises: session.exercises.map(copyExercise) }
}
