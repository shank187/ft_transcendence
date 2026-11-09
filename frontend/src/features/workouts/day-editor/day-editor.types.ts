import type { ExerciseSummary, PlannedSet, SetType } from "../shared/workouts.types"

export interface DayExercise {           // WorkoutExercise
    id: string
    order: number
    restSeconds: number | null
    exerciseSummary: ExerciseSummary
    sets: PlannedSet[]
}

export interface DayDetail {             // WorkoutDay + plan name
    id: string
    name: string
    dayOrder: number
    planId: string
    planName: string
    exercises: DayExercise[]
}

export interface DraftSet{
    key: string,
    setType: SetType,
    weight: string,
    reps: string,
    duration: string,
    distance: string,
}

export interface DraftExercise{
    key: string,
    restSeconds: string,
    exerciseSummary: ExerciseSummary
    sets: DraftSet[]
}

export type SetTargets = Pick<PlannedSet,
    "setType" | "targetWeight" | "targetReps" | "targetDuration" | "targetDistance">

// Array position is the order: exercise i gets order i + 1, set j gets
// setNumber j + 1. The client never sends order, setNumber or row ids.
export interface SaveDayBody {
    exercises: { exerciseId: string; restSeconds: number | null; sets: SetTargets[] }[]
}
