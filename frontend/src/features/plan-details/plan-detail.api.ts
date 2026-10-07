import type {PlanDay, PlanDetail } from "./plan-detail.types";


// FAKE-DATA:
export default async function getPlanDetails(planId: string): Promise<PlanDetail | null> {

    await new Promise((resolve)=> setTimeout(resolve, 500))

    if(planId === "fail")
        throw new Error("Failed to load workout, try again")

    if(planId === "missing") return null
    const plan: PlanDetail = {
        id: planId,
        name: "Push Pull Legs",
        description: "Hypertrophy split, 3 days per week",
        type: "CUSTOM",
        days: [{
            id : "push-day-1",
            name: "Push",
            dayOrder: 1,
            exerciseCount: 5,
            setCount: 18
        },{
            id : "pull-day-2",
            name: "Pull",
            dayOrder: 2,
            exerciseCount: 5,
            setCount: 17
        },{
            id : "legs-day-3",
            name: "Legs",
            dayOrder: 3,
            exerciseCount: 0,
            setCount: 0
        },
    ]
    }
    if(planId === "empty")
        return{...plan, days: []}
    return plan;
}

// FAKE-DATA:
// FAKE-DATA: nextOrder is supplied by the UI only for this mock.
// The real backend will calculate it.
export async function createWorkoutDay(
    planId: string,
    name: string,
    nextOrder: number
    ): Promise<PlanDay> {
    await new Promise(resolve => setTimeout(resolve, 500))

    if (planId === "missing")
        throw new Error("Plan not found or unavailable")
    if (name === "fail")
        throw new Error("Failed to create your day, try again.")

    return {
        id: crypto.randomUUID(),
        name,
        dayOrder: nextOrder,
        exerciseCount: 0,
        setCount: 0,
    }
}

// FAKE-DATA: real version will be PATCH /api/workout-plans/:planId/days/:dayId
export async function renameWorkoutDay(planId: string, dayId: string, name: string): Promise<PlanDay> {
    await new Promise(resolve => setTimeout(resolve, 500))
    if (name === "fail") throw new Error("Failed to rename your day, try again.")
    return { id: dayId, name, dayOrder: 0, exerciseCount: 0, setCount: 0 } // UI merges only `name`
}

// FAKE-DATA: real version will be DELETE /api/workout-plans/:planId/days/:dayId (204, no body)
// Fail trigger: dayId "legs-day-3". The backend will also renumber dayOrder.
export async function deleteWorkoutDay(planId: string, dayId: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    if (planId === "missing") throw new Error("Plan not found or unavailable")
    if (dayId === "legs-day-3") throw new Error("Failed to delete your day, try again.")
}