import { prisma } from "../../lib/prisma";


export function getWorkoutPlans(userId: string)
{
    const fetchedWorkoutPlans= prisma.workoutPlan.findMany({
        where: {
            userId: userId,
        },
        select:
        {
            name: true,
            description: true,
            type: true,
            days: true
        }
    })
}