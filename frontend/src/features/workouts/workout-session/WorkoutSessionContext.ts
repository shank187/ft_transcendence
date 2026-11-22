import { createContext, useContext } from "react"
import type { SetType } from "../shared/workouts.types"
import type { PerformedValues } from "./workout-session.types"

// busyId: the item a request runs for. error: shown next to that item only.
export interface RequestStatus {
    busyId: string | null
    error: { id: string, message: string } | null
}

export const IDLE: RequestStatus = { busyId: null, error: null }

// Actions and page flags only; the exercise and the set still come as props.
export interface WorkoutSessionActions {
    isReadOnly: boolean
    prSetIds: Set<string>

    // These two throw: the row shows the error next to its tick.
    completeSet: (exerciseId: string, setId: string, values: PerformedValues) => Promise<void>
    uncompleteSet: (exerciseId: string, setId: string) => Promise<void>

    openSetMenuId: string | null
    toggleSetMenu: (setId: string) => void
    changeSetType: (exerciseId: string, setId: string, setType: SetType) => void
    removeSet: (exerciseId: string, setId: string) => void
    // By set id.
    setMenu: RequestStatus

    addSet: (exerciseId: string) => void
    // By exercise id.
    addingSet: RequestStatus

    moveExercise: (exerciseId: string, direction: -1 | 1) => void
    // By exercise id.
    moving: RequestStatus
}

export const WorkoutSessionContext = createContext<WorkoutSessionActions | null>(null)

export function useWorkoutSession(): WorkoutSessionActions
{
    const actions = useContext(WorkoutSessionContext)
    if (!actions)
        throw new Error("useWorkoutSession must be used inside WorkoutSessionContext.Provider (WorkoutSessionView).")
    return actions
}
