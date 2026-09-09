import api from '../auth/axiosInstance'
import type { Exercise } from './exercise.types'

export async function getExercises(): Promise<Exercise[]> {
    const response = await api.get<Exercise[]>('/api/exercises')
    return response.data
}