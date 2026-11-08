import api from "../auth/axiosInstance";
import type { PostWorkoutPlan as ReqWorkoutPlan, WorkoutPlan } from "./workout.types";
import { toApiError } from "./api-error";


export async function getWorkouts(): Promise<WorkoutPlan[]>
{
    try {
        const resp = await api.get<WorkoutPlan[]>("/api/workout-plans");
        return resp.data;
    } catch (error) {
        throw toApiError(error, "Could not load your plans. Please try again.");
    }
}

export async function postWorkoutPlan(body: ReqWorkoutPlan): Promise<WorkoutPlan>
{
    try {
        const resp = await api.post<WorkoutPlan>("/api/workout-plans", body);
        return resp.data;
    } catch (error) {
        throw toApiError(error, "Could not create the plan. Please try again.");
    }
}
