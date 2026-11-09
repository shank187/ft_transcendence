import api from "../../auth/axiosInstance";
import type { PlanDay, PlanDetail, WorkoutPlanInput } from "../shared/workouts.types";
import { toApiError } from "../shared/api-error";

// The server picks the day's id and dayOrder.
export async function createWorkoutDay(planId: string, name: string): Promise<PlanDay> {
    try{
        const resp = await api.post<PlanDay>(`/api/workout-plans/${planId}/days`, { name })
        return resp.data
    }catch(error){
        throw toApiError(error, "Could not add the day. Please try again.")
    }
}

export async function renameWorkoutDay(planId: string, dayId: string, name: string): Promise<PlanDay> {
    try{
        const result = await api.patch<PlanDay>(`/api/workout-plans/${planId}/days/${dayId}`,{name})
        return result.data
    }catch(error){
        throw toApiError(error, "Could not rename the day. Please try again.")
    }
}

// The server returns the remaining days, renumbered 1..n and sorted by dayOrder.
export async function deleteWorkoutDay(planId: string, dayId: string): Promise<PlanDay[]> {
    try{
        const resp = await api.delete<PlanDay[]>(`/api/workout-plans/${planId}/days/${dayId}`)
        return resp.data
    }catch(error){
        throw toApiError(error, "Could not delete the day. Please try again.")
    }
}

// Sends name + description every time, like create.
export async function renamePlan(planId: string, body: WorkoutPlanInput): Promise<PlanDetail> {
    try{
        const resp = await api.patch<PlanDetail>(`/api/workout-plans/${planId}`, body)
        return resp.data
    }catch(error){
        throw toApiError(error, "Could not update the plan. Please try again.")
    }
}

export async function deletePlan(planId: string): Promise<void> {
    try{
        await api.delete(`/api/workout-plans/${planId}`)
    }catch(error){
        throw toApiError(error, "Could not delete the plan. Please try again.")
    }
}
