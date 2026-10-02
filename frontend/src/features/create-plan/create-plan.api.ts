import type { WorkoutPlan } from "../workouts/workout.types";
import type { CreatePlanInput } from "./create-plan.types";

// FAKE-DATA: no POST /api/workout-plans yet; replace with api.post
export default async function createWorkoutPlan(infos: CreatePlanInput):Promise<WorkoutPlan>
{
    await new Promise((resolve) => setTimeout(resolve, 500));
    if(infos.name === "fail")
        throw new Error("Fake Error");
    return ({id: "1234",
        name: infos.name,
        description: infos.description,
        type: "CUSTOM",
        days: 4
    })

}