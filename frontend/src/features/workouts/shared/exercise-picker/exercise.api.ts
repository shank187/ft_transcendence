import api from '../../../auth/axiosInstance'
import type {ExerciseQuery, ExerciseList } from './exercise.types'
import { toApiError } from '../api-error'
import type { ExerciseFilters } from '../../../../../../shared/exercises'

export async function getExercises(query: ExerciseQuery): Promise<ExerciseList> {
    try {
        const response = await api.get<ExerciseList>(
            '/api/exercises',
            {
                params: query
            }
        )
        return response.data
    } catch (error) {
        throw toApiError(error, "Could not load exercises. Please try again.")
    }
}

export async function getExerciseFilter():
Promise<ExerciseFilters>
{
    try {
        const resp = await api.get<ExerciseFilters>('/api/exercises/filters')
        return resp.data
    } catch (error) {
        throw toApiError(error, "Could not load the filters. Please try again.")
    }
}
