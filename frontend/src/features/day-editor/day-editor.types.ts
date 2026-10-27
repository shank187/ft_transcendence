import type { ExerciseType } from "../exercises/exercise.types"

export type SetType = "NORMAL" | "WARMUP" | "DROP" | "FAILURE"

export interface PlannedSet {            // WorkoutExerciseSet
    id: string
    setNumber: number
    setType: SetType
    targetWeight: number | null
    targetReps: number | null
    targetDuration: number | null
    targetDistance: number | null
}

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

export interface ExerciseSummary {
    id: string
    name: string
    type: ExerciseType
    primaryMuscle: string
    imageUrl: string | null
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
