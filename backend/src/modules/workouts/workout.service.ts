import { prisma } from "../../lib/prisma";

export async function getWorkoutPlans(userId: string)
{
    
    const fetchedWorkoutPlans= await prisma.workoutPlan.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            name: 'asc',
        },
        select:
        {
            id: true,
            name: true,
            description: true,
            type: true,
            _count:{
                select:{
                    days: true,
                }
            }
        }
    })

    const dtoWorkoutPlans =  fetchedWorkoutPlans.map((element)=>(
    {
        id: element.id,
        name: element.name,
        description: element.description,
        type: element.type,
        days: element._count.days,
    }))
    return dtoWorkoutPlans;
}


