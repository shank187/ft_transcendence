import type { WorkoutSession, WorkoutSessionExercise, WorkoutSessionSet } from "../shared/workouts.types"
import { orderExercises, updateExercise, updateSet } from "./workout-session.helpers"

export type SessionState =
    | { status: "loading" }
    | { status: "error", message: string }
    | { status: "notFound" }
    | { status: "success", session: WorkoutSession }

// Each action stores what the API returned.
export type SessionAction =
    | { type: "loaded", session: WorkoutSession }
    | { type: "notFound" }
    | { type: "loadFailed", message: string }
    | { type: "reloading" }
    | { type: "exercisesAdded", exercises: WorkoutSessionExercise[] }
    | { type: "setSaved", exerciseId: string, setId: string, set: WorkoutSessionSet }
    | { type: "setAdded", exerciseId: string, set: WorkoutSessionSet }
    | { type: "setRemoved", exerciseId: string, setId: string }
    | { type: "reordered", ids: string[] }
    | { type: "finished", session: WorkoutSession }

export function sessionReducer(state: SessionState, action: SessionAction): SessionState
{
    switch (action.type) {
        case "loaded":
            return { status: "success", session: action.session }
        case "notFound":
            return { status: "notFound" }
        case "loadFailed":
            return { status: "error", message: action.message }
        case "reloading":
            return { status: "loading" }
    }

    // An answer that arrives after a reload started is dropped.
    if (state.status !== "success")
        return state
    const { session } = state

    switch (action.type) {
        case "exercisesAdded":
            return withExercises(state, [...session.exercises, ...action.exercises])
        case "setSaved":
            return withExercises(state, updateSet(session.exercises, action.exerciseId, action.setId, () => action.set))
        // Matched by id, not by index: a move can reorder the list while the request runs.
        case "setAdded":
            return withExercises(state, updateExercise(session.exercises, action.exerciseId,
                exercise => ({ ...exercise, sets: [...exercise.sets, action.set] })))
        case "setRemoved":
            return withExercises(state, updateExercise(session.exercises, action.exerciseId,
                exercise => ({ ...exercise, sets: exercise.sets.filter(set => set.id !== action.setId) })))
        // The server's order is the truth: rebuild from the ids it returns instead of swapping locally.
        case "reordered":
            return withExercises(state, orderExercises(session.exercises, action.ids))
        case "finished":
            return { status: "success", session: action.session }
    }
}

function withExercises(state: { status: "success", session: WorkoutSession }, exercises: WorkoutSessionExercise[]): SessionState
{
    return { ...state, session: { ...state.session, exercises } }
}
