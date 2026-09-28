import api from "../auth/axiosInstance";
import type { WorkoutPlan } from "./workout.types";


export default async function getWorkouts(): Promise<WorkoutPlan[]>
{
    const resp = await api.get<WorkoutPlan[]>("/api/workout-plans");
    
    return resp.data;
}
