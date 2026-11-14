// What the exercises API sends. Read by the backend and the frontend; see workouts.d.ts.

// Same values as the ExerciseType enum in backend/prisma/schema.prisma.
export type ExerciseType =
    | "WEIGHT_REPS" | "BODYWEIGHT_REPS" | "WEIGHTED_BODYWEIGHT" | "ASSISTED_BODYWEIGHT"
    | "DURATION" | "WEIGHT_DURATION" | "DISTANCE_DURATION"

// GET /api/exercises?sort=… (default name_asc)
export type ExerciseSort = "name_asc" | "name_desc"

// GET /api/exercises
export interface ExerciseItem
{
    id: string,
    name: string,
    type: ExerciseType,
    primaryMuscle: string,
    secondaryMuscles: string[],
    equipment: string[],
    description: string | null,
    imageUrl: string | null,
}

export interface ExerciseList
{
    items: ExerciseItem[],
    page: number,
    limit: number,
    total: number,
    totalPages: number,
}

// GET /api/exercises/filters
interface FilterOption
{
    id: string,
    name: string,
}

export interface ExerciseFilters
{
    muscles: FilterOption[],
    equipment: FilterOption[],
    gym: { id: string; name: string } | null}

// The exercise as the day editor and the workout page show it.
export interface ExerciseSummary
{
    id: string,
    name: string,
    type: ExerciseType,
    primaryMuscle: string,
    imageUrl: string | null,
}
