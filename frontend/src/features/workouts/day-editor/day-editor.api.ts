import { isAxiosError } from "axios";
import type { DayDetail, SaveDayBody } from "./day-editor.types";
import api from "../../auth/axiosInstance";
import { toApiError } from "../shared/api-error";

// null when the day doesn't exist or isn't in one of the user's plans (404).
export default async function getWorkoutDay(planId: string, dayId: string): Promise<DayDetail | null> {
    try{
        const resp = await api.get<DayDetail>(`/api/workout-plans/${planId}/days/${dayId}`)
        return resp.data
    }catch(err){
        if(isAxiosError(err) && err.response?.status === 404) return null
        throw toApiError(err, "Could not load the day. Please try again.")
    }
}

export async function saveWorkoutDay(planId: string, dayId: string, body: SaveDayBody): Promise<DayDetail> {
    try{
        const resp = await api.put<DayDetail>(`/api/workout-plans/${planId}/days/${dayId}/exercises`, body)
        return resp.data
    }catch(error){
        throw toApiError(error, "Can't save your changes, try again later.")
    }
}
