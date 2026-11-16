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
    // true: only exercises doable at the user's current gym (the server knows which gym).
    gym?: boolean
}
