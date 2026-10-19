// GET /api/exercises
export interface ExerciseQuery {
    page: number
    limit: number
    search?: string
    muscle?: string
    equipment?: string
}

export interface Exercise {
    id: string
    name: string
    type: string
    primaryMuscle: string
    secondaryMuscles: string[]
    equipment: string[]
    description: string | null
    imageUrl: string | null
}

export interface PaginatedExercises {
    items: Exercise[]
    page: number
    limit: number
    total: number
    totalPages: number
}

// GET /api/exercises/filters
export interface FilterOption {
    id: string
    name: string
}
    

export interface ExerciseFilters {
    muscles: FilterOption[]
    equipment: FilterOption[]
}

