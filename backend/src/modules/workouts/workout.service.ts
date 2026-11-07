import { prisma } from "../../lib/prisma";
import type { WorkoutPlanType } from "@prisma/client";
import type { CreateWorkoutPlanBody } from "./workout.schema";
import {PlanDetail} from "./workouts.types";

type PlanRowDb = {
    id: string;
    name: string;
    description: string | null;
    type: WorkoutPlanType;
    _count: { days: number };
};

type DayRowDb = {
    id: string,
    name: string,
    dayOrder: number,
    exercises: {_count: { sets: number}}[],
}

type PlanDetailRowDb = {
    id: string;
    name: string;
    description: string | null;
    type: WorkoutPlanType;
    days: DayRowDb[];
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

function planDetailDto(planDetail: PlanDetailRowDb): PlanDetail
{
    return{
        id: planDetail.id,
        name: planDetail.name,
        description: planDetail.description,
        type: planDetail.type,
        days: planDetail.days.map((day)=>({
            id: day.id,
            name: day.name,
            dayOrder: day.dayOrder,
            exerciseCount: day.exercises.length,
            setCount: day.exercises.reduce((accumulator, next)=>(accumulator + next._count.sets), 0)
        }))
    }
}

export async function getWorkoutDetail(userId: string, planId: string):Promise<PlanDetail|null>
{
    const PlanDeatilDbShape = await prisma.workoutPlan.findUnique({
        where: { 
            userId: userId, id: planId
        },select:{
            id: true,
            name: true,
            description: true,
            type: true,
            days: {
                orderBy: {dayOrder: "asc"},
                select:{
                    id: true,
                    name: true,
                    dayOrder: true,
                    exercises: {
                        select:{_count:{select:{sets: true}}}
                    }
                }
            }
        }
    })
    if(PlanDeatilDbShape)
        return planDetailDto(PlanDeatilDbShape)
    return null
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
            _count: {select: { days: true }},
        },
    });

    return toWorkoutPlanDto(plan);
}
