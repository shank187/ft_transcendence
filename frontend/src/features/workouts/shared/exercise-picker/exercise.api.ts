import api from '../../../auth/axiosInstance'
import type { ExerciseFilters, ExerciseQuery, ExerciseList } from './exercise.types'
import { toApiError } from '../api-error'

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
        // TODO(g-01): the server does not send the user's gym yet. null keeps the
        // "available at my gym" button disabled until it does.
        return { ...resp.data, gym: null }
    } catch (error) {
        throw toApiError(error, "Could not load the filters. Please try again.")
    }
}
