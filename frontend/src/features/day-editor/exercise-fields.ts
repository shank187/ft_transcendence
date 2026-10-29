import type { ExerciseType } from "../exercises/exercise.types"
import type { SetType } from "./day-editor.types"

export type FieldKey = "weight" | "reps" | "duration" | "distance"
export interface SetField { key: FieldKey; label: string }

export const EXERCISE_FIELDS: Record<ExerciseType, SetField[]> = {
    WEIGHT_REPS:         [{ key: "weight", label: "KG" },  { key: "reps", label: "REPS" }],
    BODYWEIGHT_REPS:     [{ key: "reps", label: "REPS" }],
    WEIGHTED_BODYWEIGHT: [{ key: "weight", label: "+KG" }, { key: "reps", label: "REPS" }],
    ASSISTED_BODYWEIGHT: [{ key: "weight", label: "−KG" }, { key: "reps", label: "REPS" }],
    DURATION:            [{ key: "duration", label: "SEC" }],
    WEIGHT_DURATION:     [{ key: "weight", label: "KG" },  { key: "duration", label: "SEC" }],
    DISTANCE_DURATION:   [{ key: "distance", label: "M" }, { key: "duration", label: "SEC" }],
}

export const EXERCISE_TYPE_LABEL: Record<ExerciseType, string> = {
    WEIGHT_REPS: "Weight + reps", BODYWEIGHT_REPS: "Reps", WEIGHTED_BODYWEIGHT: "Added weight + reps",
    ASSISTED_BODYWEIGHT: "Assistance + reps", DURATION: "Time", WEIGHT_DURATION: "Weight + time",
    DISTANCE_DURATION: "Distance + time",
}

export const SET_TYPE_LABEL: Record<SetType, string> = {
    NORMAL: "Normal", WARMUP: "Warm-up", DROP: "Drop", FAILURE: "Failure",
}

// no NORMAL here, normal sets show their number counted among normal sets only
export const SET_TYPE_LETTER: Record<Exclude<SetType, "NORMAL">, string> = {
    WARMUP: "W", DROP: "D", FAILURE: "F",
}
