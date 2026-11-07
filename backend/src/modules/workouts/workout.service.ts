import { prisma } from "../../lib/prisma";
import { Prisma, type WorkoutPlanType } from "@prisma/client";
import type { CreateWorkoutPlanBody } from "./workout.schema";
import {PlanDay, PlanDetail} from "./workouts.types";

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


function isUniqueViolation(error: unknown): boolean
{
    return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002";
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

type CreateDayResult =
    | { ok: true; day: PlanDay}
    | { ok: false; reason: "NOT_FOUND" | "TOO_MANY_DAYS" | "CONFLICT"};

export async function postWorkoutDay(userId: string, planId: string, name: string): Promise<CreateDayResult>
{
    const plan = await prisma.workoutPlan.findUnique({
        where: { id: planId, userId },
        select: {
            _count: { select: { days: true } },
            days: { select: { dayOrder: true }, orderBy: { dayOrder: "desc" }, take: 1 },
        },
    })
    if (!plan) return { ok: false, reason: "NOT_FOUND" }
    if (plan._count.days >= 7) return { ok: false, reason: "TOO_MANY_DAYS" }
    try
    {
        const day = await prisma.workoutDay.create({
            data: { workoutPlanId: planId, name, dayOrder: (plan.days[0]?.dayOrder ?? 0) + 1 },
            select: { id: true, name: true, dayOrder: true },
        })
        return { ok: true, day: { ...day, exerciseCount: 0, setCount: 0 } }
    }catch(error){
        if(isUniqueViolation(error))
            return({ok: false, reason:"CONFLICT"})
        throw error
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
