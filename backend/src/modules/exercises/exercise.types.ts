import type { ExerciseType } from "@prisma/client";

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

type FilterOption = {
    id: string;
    name: string;
}

export type ExerciseFilters = {
    muscles: FilterOption[];
    equipment: FilterOption[];
}
