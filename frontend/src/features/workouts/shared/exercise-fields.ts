import type { ExerciseType } from "./exercise-picker/exercise.types"
import type { SetType } from "./workouts.types"
import { FIELDS, type FieldKey } from "./set-values"

export interface SetField { key: FieldKey; label: string }

function column(key: FieldKey, label = FIELDS[key].label): SetField
{
    return { key, label }
}

export const EXERCISE_FIELDS: Record<ExerciseType, SetField[]> = {
    WEIGHT_REPS:         [column("weight"), column("reps")],
    BODYWEIGHT_REPS:     [column("reps")],
    WEIGHTED_BODYWEIGHT: [column("weight", "+KG"), column("reps")],
    ASSISTED_BODYWEIGHT: [column("weight", "−KG"), column("reps")],
    DURATION:            [column("duration")],
    WEIGHT_DURATION:     [column("weight"), column("duration")],
    DISTANCE_DURATION:   [column("distance"), column("duration")],
}

export const EXERCISE_TYPE_LABEL: Record<ExerciseType, string> = {
    WEIGHT_REPS: "Weight + reps", BODYWEIGHT_REPS: "Reps", WEIGHTED_BODYWEIGHT: "Added weight + reps",
    ASSISTED_BODYWEIGHT: "Assistance + reps", DURATION: "Time", WEIGHT_DURATION: "Weight + time",
    DISTANCE_DURATION: "Distance + time",
}

// Menu order.
export const SET_TYPES: SetType[] = ["NORMAL", "HEAVY", "WARMUP", "DROP", "FAILURE"]

export const SET_TYPE_LABEL: Record<SetType, string> = {
    NORMAL: "Normal", HEAVY: "Heavy", WARMUP: "Warm-up", DROP: "Drop", FAILURE: "Failure",
}

// no NORMAL here, normal sets show their number counted among normal sets only
const SET_TYPE_LETTER: Record<Exclude<SetType, "NORMAL">, string> = {
    HEAVY: "H", WARMUP: "W", DROP: "D", FAILURE: "F",
}

export function setLabel(sets: { setType: SetType }[], index: number): string {
    const setType = sets[index].setType
    return setType === "NORMAL"
        ? String(sets.slice(0, index + 1).filter(s => s.setType === "NORMAL").length)
        : SET_TYPE_LETTER[setType]
}
