import { isAxiosError } from "axios";
import api from "../../auth/axiosInstance";
import type { HomeDay, PlanDetail } from "./workouts.types";
import { toApiError } from "./api-error";

export async function getPlanDetails(planId: string): Promise<PlanDetail | null> {
    try{
        const resp = await api.get<PlanDetail>(`/api/workout-plans/${planId}`)
        return resp.data
    }catch(err){
        if(isAxiosError(err) && err.response?.status === 404) return null
        throw toApiError(err, "Could not load the plan. Please try again.")
    }
}

export async function getNextDay(): Promise<HomeDay | null>
{
    try{
        const resp = await api.get<HomeDay | null>('/api/workout-plans/nextday')
        return resp.data
    }catch(err){
        throw toApiError(err, "Could not load the plan. Please try again.")
    }
}
