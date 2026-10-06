import type {PlanDetail } from "./plan-detail.types";


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