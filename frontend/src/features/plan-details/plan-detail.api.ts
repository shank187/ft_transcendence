import { isAxiosError } from "axios";
import api from "../auth/axiosInstance";
import type {PlanDay, PlanDetail } from "./plan-detail.types";
import { toApiError } from "../workouts/api-error";
import type { PostWorkoutPlan } from "../workouts/workout.types";

const FAKE_DELAY_MS = 500

// FAKE-DATA: the "database". One entry per planId, created on first use.
const plans = new Map<string, PlanDetail>()

// FAKE-DATA: remembers which "flaky" requests already failed once.
const flakyAttempts = new Set<string>()

// FAKE-DATA: planIds deleted with deletePlan().
const deletedPlans = new Set<string>()

// FAKE-DATA:
function wait() {
    return new Promise(resolve => setTimeout(resolve, FAKE_DELAY_MS))
}

// FAKE-DATA: returns the stored plan, seeding it the first time any
// function (GET or mutation) asks for this planId.
function findPlan(planId: string): PlanDetail | null {
    if (planId === "missing" || deletedPlans.has(planId)) return null

    let plan = plans.get(planId)
    if (!plan) {
        plan = {
            id: planId,
            name: "Push Pull Legs",
            description: "Hypertrophy split, 3 days per week",
            type: "CUSTOM",
            days: planId === "empty" ? [] : [
                { id: "push-day-1", name: "Push", dayOrder: 1, exerciseCount: 5, setCount: 18 },
                { id: "pull-day-2", name: "Pull", dayOrder: 2, exerciseCount: 5, setCount: 17 },
                { id: "legs-day-3", name: "Legs", dayOrder: 3, exerciseCount: 0, setCount: 0 },
            ],
        }
        plans.set(planId, plan)
    }
    return plan
}

// FAKE-DATA:
function findPlanOrThrow(planId: string): PlanDetail {
    const plan = findPlan(planId)
    if (!plan) throw new Error("Plan not found or unavailable")
    return plan
}

// FAKE-DATA: on the "flaky" plan, the first attempt of each request fails.
function failFirstAttempt(planId: string, requestKey: string, message: string) {
    if (planId !== "flaky" || flakyAttempts.has(requestKey)) return
    flakyAttempts.add(requestKey)
    throw new Error(message)
}

// FAKE-DATA: PlanDay only holds strings and numbers, so a spread is a full
// copy. Callers get copies, never the stored objects.
function copyDay(day: PlanDay): PlanDay {
    return { ...day }
}

// FAKE-DATA:
function sortedDays(days: PlanDay[]): PlanDay[] {
    return [...days].sort((a, b) => a.dayOrder - b.dayOrder)
}

export default async function getPlanDetails(planId: string): Promise<PlanDetail | null> {
    try{
        const resp = await api.get<PlanDetail>(`/api/workout-plans/${planId}`)
        return resp.data
    }catch(err){
        if(isAxiosError(err) && err.response?.status == 404) return null
        throw toApiError(err, "Could not load the plan. Please try again.")
    }
}

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

// FAKE-DATA: proposed real version: DELETE /api/workout-plans/:planId/days/:dayId
// returning 200 with the remaining days, renumbered 1..n and sorted by dayOrder.
export async function deleteWorkoutDay(planId: string, dayId: string): Promise<PlanDay[]> {
    await wait()

    const plan = findPlanOrThrow(planId)
    if (!plan.days.some(d => d.id === dayId)) throw new Error("Day not found")
    failFirstAttempt(planId, `delete:${dayId}`, "Failed to delete your day, try again.")

    // Keep the old order, then give the remaining days 1, 2, 3...
    const remainingDays = sortedDays(plan.days)
        .filter(d => d.id !== dayId)
        .map((d, index) => ({ ...d, dayOrder: index + 1 }))
    plans.set(planId, { ...plan, days: remainingDays })
    return remainingDays.map(copyDay)
}

// Sends name + description every time, like create.
export async function renamePlan(planId: string, body: PostWorkoutPlan): Promise<PlanDetail> {
    try{
        const resp = await api.patch<PlanDetail>(`/api/workout-plans/${planId}`, body)
        return resp.data
    }catch(error){
        throw toApiError(error, "Could not update workout's Plan.")
    }
}

// FAKE-DATA: real version will be DELETE /api/workout-plans/:planId
export async function deletePlan(planId: string): Promise<void> {
    await wait()

    findPlanOrThrow(planId)
    failFirstAttempt(planId, "delete-plan", "Failed to delete your plan, try again.")
    plans.delete(planId)
    deletedPlans.add(planId)
}
