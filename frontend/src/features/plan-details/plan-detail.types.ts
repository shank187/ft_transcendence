
export interface planDay
{
    id: string,
    name: string,
    dayOrder: number,
    exerciseCount: number,
    setCount: number,
}

export interface PlanDetail{
    id:string
    name:string,
    description: string | null,
    type: string
    days: planDay[],
}