import { prisma } from "../../lib/prisma";
import type { WorkoutPlanType } from "@prisma/client";
import type { CreateWorkoutPlanBody } from "./workout.schema";

type PlanRowDb = {
    id: string;
    name: string;
    description: string | null;
    type: WorkoutPlanType;
    _count: { days: number };
};

function toWorkoutPlanDto(plan: PlanRowDb)
{
    return {
        id: plan.id,
        name: plan.name,
        description: plan.description,
        type: plan.type,
        days: plan._count.days,
    };
}

export async function getWorkoutPlans(userId: string)
{
    const fetchedWorkoutPlans = await prisma.workoutPlan.findMany({
        where: {
            userId: userId,
        },
        orderBy: {
            name: 'asc',
        },
        select: {
            id: true,
            name: true,
            description: true,
            type: true,
            _count: {
                select: {
                    days: true,
                }
            }
        }
    });

    return fetchedWorkoutPlans.map(toWorkoutPlanDto);
}

export async function postWorkoutPlan(userId: string, workoutPlan: CreateWorkoutPlanBody)
{
    const plan = await prisma.workoutPlan.create({
        data: { userId, ...workoutPlan },
        select: {
            id: true,
            name: true,
            description: true,
            type: true,
            _count: { select: { days: true } },
        },
    });

    return toWorkoutPlanDto(plan);
}
