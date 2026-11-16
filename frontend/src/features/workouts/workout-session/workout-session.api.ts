import { isAxiosError } from "axios";
import api from "../../auth/axiosInstance";
import { toApiError } from "../shared/api-error";
import type { FinishWorkoutResponse, WorkoutSession, WorkoutSessionExercise, WorkoutSessionSet } from "../shared/workouts.types";
import type { SetPatch } from "./workout-session.types";

// null when the workout doesn't exist or belongs to another user (404).
export async function getWorkoutSession(id: string): Promise<WorkoutSession | null> {
    try{
        const resp = await api.get<WorkoutSession>(`/api/workout-sessions/${id}`)
        return resp.data
    }catch(error){
        if(isAxiosError(error) && error.response?.status === 404) return null
        throw toApiError(error, "Failed to load workout, try again.")
    }
}

// Only the fields present in the patch change. Returns the saved set.
export async function updateSessionSet(sessionId: string, setId: string, patch: SetPatch): Promise<WorkoutSessionSet> {
    try{
        const resp = await api.patch<WorkoutSessionSet>(`/api/workout-sessions/${sessionId}/sets/${setId}`, patch)
        return resp.data
    }catch(error){
        throw toApiError(error, "Failed to save, try again.")
    }
}

export async function addSet(sessionId: string, exerciseId: string): Promise<WorkoutSessionSet> {
    try{
        const resp = await api.post<WorkoutSessionSet>(`/api/workout-sessions/${sessionId}/exercises/${exerciseId}/sets`)
        return resp.data
    }catch(error){
        throw toApiError(error, "Failed to add the set, try again.")
    }
}

// Ticked sets can be deleted too. The server renumbers the remaining sets 1..n.
export async function deleteSet(sessionId: string, setId: string): Promise<void> {
    try{
        await api.delete(`/api/workout-sessions/${sessionId}/sets/${setId}`)
    }catch(error){
        throw toApiError(error, "Failed to remove the set, try again.")
    }
}

// All or none: one bad id and nothing is added. Returns the new exercises.
export async function addExercises(sessionId: string, exerciseIds: string[]): Promise<WorkoutSessionExercise[]> {
    try{
        const resp = await api.post<WorkoutSessionExercise[]>(`/api/workout-sessions/${sessionId}/exercises`, { exerciseIds })
        return resp.data
    }catch(error){
        throw toApiError(error, "Can't add exercises, try again.")
    }
}

// Swaps order with the neighbour. Returns the exercise ids in their new order.
export async function moveExercise(sessionId: string, exerciseId: string, direction: -1 | 1): Promise<string[]> {
    try{
        const resp = await api.patch<string[]>(`/api/workout-sessions/${sessionId}/exercises/${exerciseId}`, { direction })
        return resp.data
    }catch(error){
        throw toApiError(error, "Can't move this exercise, try again.")
    }
}

// Safe to repeat: finishing a finished workout returns it again, with award null.
export async function finishWorkout(id: string): Promise<FinishWorkoutResponse> {
    try{
        const resp = await api.post<FinishWorkoutResponse>(`/api/workout-sessions/${id}/finish`)
        return resp.data
    }catch(error){
        throw toApiError(error, "Can't finish your workout, try again.")
    }
}
