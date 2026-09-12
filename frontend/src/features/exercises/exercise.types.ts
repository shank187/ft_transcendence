export interface Exercise{
    id: string
    name: string
    type: string
    primaryMuscle: string
    secondaryMuscles: string[]
    equipment: string[]
    description: string| null
    imageUrl: string | null
}

export interface PaginatedExercises{
    items: Exercise[],
    page: number,
    limit: number,
    total: number,
    totalPages: number

}