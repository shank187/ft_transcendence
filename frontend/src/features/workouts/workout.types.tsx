export interface WorkoutPlan
{
    id:string,
    name: string,
    type: string,
    days: number,
    description: string,
}

export interface WorkoutPlanList
{
    plans: WorkoutPlan[],
}