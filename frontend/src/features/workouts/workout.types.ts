export interface WorkoutPlan
{
    id:string,
    name: string,
    description: string | null,
    type: string,
    days: number,
}

export interface WorkoutPlanInput
{
    name: string,
    description: string | null,
}

