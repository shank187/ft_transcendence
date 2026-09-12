import api from '../auth/axiosInstance'
import type {PaginatedExercises } from './exercise.types'

export async function getExercises(page: number, limit: number): Promise<PaginatedExercises> {
    const response = await api.get<PaginatedExercises>(
        '/api/exercises',
        {
            params:{
                page,
                limit,
            },
        }
    )
    return response.data
}