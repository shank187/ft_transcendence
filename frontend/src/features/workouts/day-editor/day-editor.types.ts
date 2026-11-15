import type { ExerciseSummary, SetType } from "../shared/workouts.types"

export type { DayDetail, DayExercise, SaveDayBody, SetTargets } from "../../../../../shared/workouts"

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
