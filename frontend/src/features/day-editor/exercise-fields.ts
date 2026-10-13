import type { ExerciseType } from "./day-editor.types"

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