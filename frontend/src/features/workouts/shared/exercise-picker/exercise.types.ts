import type { ExerciseFilters as ServerExerciseFilters } from "../../../../../../shared/exercises"

export type { ExerciseItem, ExerciseList, ExerciseType } from "../../../../../../shared/exercises"

// GET /api/exercises
export interface ExerciseQuery {
    page: number
    limit: number
    search?: string
    muscle?: string
    equipment?: string
    gymId?: string
}

// FAKE-DATA: the backend does not send gym; getExerciseFilter adds it until S1 adds gymId on User.
export interface ExerciseFilters extends ServerExerciseFilters {
    gym: { id: string; name: string } | null
}
