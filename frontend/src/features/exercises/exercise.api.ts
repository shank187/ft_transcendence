import api from '../auth/axiosInstance'
import type {ExerciseFilters, ExerciseQuery, PaginatedExercises } from './exercise.types'

export async function getExercises(query: ExerciseQuery): Promise<PaginatedExercises> {
    const response = await api.get<PaginatedExercises>(
        '/api/exercises',
        {
            params:query
        }
    )
    return response.data
}

export async function getExerciseFilter():
Promise<ExerciseFilters>
{
    const resp = await api.get<ExerciseFilters>('/api/exercises/filters')
    return resp.data
}