import type { ExerciseSort } from "../../../../../../shared/exercises"

export type { ExerciseItem, ExerciseList, ExerciseType } from "../../../../../../shared/exercises"

// GET /api/exercises
export interface ExerciseQuery {
    page: number
    limit: number
    search?: string
    muscle?: string
    equipment?: string
    sort?: ExerciseSort
    // TODO(g-01): sent as is; the server ignores it until the gym filter exists.
    gym?: string
}

// TODO(g-01): the backend does not send gym yet; getExerciseFilter sets it to null until it does.
