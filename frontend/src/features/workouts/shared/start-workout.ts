import { isAxiosError } from "axios";
import api from "../../auth/axiosInstance";
import { toApiError } from "./api-error";
import type { WorkoutSession } from "./workouts.types";

// Only one workout can be in progress. The API answers 409 with the
// active session id; callers offer to resume it or discard it.
export class ActiveWorkoutError extends Error {
    activeSessionId: string
    constructor(activeSessionId: string) {
        super("You have a workout in progress.")
        this.name = "ActiveWorkoutError"
        this.activeSessionId = activeSessionId
    }
}

// {} starts an empty workout, { dayId } copies that day's exercises and sets.
async function startWorkout(body: { dayId?: string }): Promise<WorkoutSession> {
    try{
        const resp = await api.post<WorkoutSession>("/api/workout-sessions", body)
        return resp.data
    }catch(error){
        // Only the "workout in progress" 409 carries an id; the other 409 is a plain message.
        if(isAxiosError<{ activeSessionId?: string }>(error) && error.response?.data?.activeSessionId)
            throw new ActiveWorkoutError(error.response.data.activeSessionId)
        throw toApiError(error, "Failed to start workout, try again.")
    }
}

export function startEmptyWorkout(): Promise<WorkoutSession> {
    return startWorkout({})
}

export function startWorkoutFromDay(dayId: string): Promise<WorkoutSession> {
    return startWorkout({ dayId })
}

export async function discardWorkout(id: string): Promise<void> {
    try{
        await api.patch(`/api/workout-sessions/${id}`, { status: "CANCELLED" })
    }catch(error){
        throw toApiError(error, "Can't discard your workout, try again.")
    }
}
