export interface WorkoutPlan
{
    id:string,
    name: string,
    description: string | null,
    type: string,
    days: number,
}

export interface PostWorkoutPlan
{
    name: string,
    description: string | null,
}

