import api from "../auth/axiosInstance";
import type { PostWorkoutPlan, WorkoutPlan } from "./workout.types";


export async function getWorkouts(): Promise<WorkoutPlan[]>
{
    const resp = await api.get<WorkoutPlan[]>("/api/workout-plans");
    
    return resp.data;
}

export async function postWorkoutPlan(body: PostWorkoutPlan): Promise<WorkoutPlan>
{
    const resp = await api.post<WorkoutPlan>("/api/workout-plans", body);
    return resp.data;
}