export type ExerciseType =
    | "WEIGHT_REPS" | "BODYWEIGHT_REPS" | "WEIGHTED_BODYWEIGHT" | "ASSISTED_BODYWEIGHT"
    | "DURATION" | "WEIGHT_DURATION" | "DISTANCE_DURATION"

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
    exercise: { id: string; name: string; type: ExerciseType; primaryMuscle: string }
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

export type TargetPatch = Partial<Pick<PlannedSet,
    "targetWeight" | "targetReps" | "targetDuration" | "targetDistance">>