import type { WorkoutPlan } from "./workout.types";


export default async function getWorkouts(): Promise<WorkoutPlan[]>
{
    // throw new Error("fake error")
    return [
        // {
        //     id: "1",
        //     name: "push-pull-leg",
        //     description:"plan for cutting",
        //     type: "custom",
        //     days: 5,
        // },
        // {
        //     id: "2",
        //     name: "pro split",
        //     description:"plan for bulking",
        //     type: "custom",
        //     days: 4,
        // },
    ]
}
