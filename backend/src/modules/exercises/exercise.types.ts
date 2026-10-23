import type { ExerciseType } from "@prisma/client";

// query
export type ListQuery = {
    page: number;
    limit: number;
    search?: string;
    muscle?: string;
    equipment?: string;
}

export type ParseListQueryReturn =
    | { ok: true; value: ListQuery }
    | { ok: false; message: string }

// response
export type ExerciseItem = {
    id: string;
    name: string;
    type: ExerciseType;
    primaryMuscle: string;
    secondaryMuscles: string[];
    equipment: string[];
    description: string | null;
    imageUrl: string | null;
}

export type ExerciseList = {
    items: ExerciseItem[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
}

export type GetExercisesReturn =
    | { ok: true; value: ExerciseList }
    | { ok: false; message: string }

export type FilterOption = {
    id: string;
    name: string;
}

export type ExerciseFilters = {
    muscles: FilterOption[];
    equipment: FilterOption[];
}
