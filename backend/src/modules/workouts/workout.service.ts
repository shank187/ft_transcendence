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

function planDayDto (dayDb: DayRowDb): PlanDay
{
    return{
        id: dayDb.id,
        name: dayDb.name,
        dayOrder: dayDb.dayOrder,
        exerciseCount: dayDb.exercises.length,
        setCount: dayDb.exercises.reduce((sum, next) => sum + next._count.sets , 0) 
    }
}

function planDetailDto(planDetail: PlanDetailRowDb): PlanDetail
{
    return{
        id: planDetail.id,
        name: planDetail.name,
        description: planDetail.description,
        type: planDetail.type,
        days: planDetail.days.map(day => planDayDto(day))
    }
}

type DayResult =
    | { ok: true; day: PlanDay}
    | { ok: false; reason: "NOT_FOUND" | "TOO_MANY_DAYS" | "CONFLICT"};

export async function postWorkoutDay(userId: string, planId: string, name: string): Promise<DayResult>
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


export async function renameWorkoutDay(userId: string, planId: string, dayId: string, name: string): Promise<DayResult> {
    const plan = await prisma.workoutPlan.findUnique({where:{id: planId, userId: userId}})
    const day = await prisma.workoutDay.findUnique({
        where:{id: dayId, workoutPlanId: planId}
    })
    if(!day || !plan)
        return {ok: false, reason: "NOT_FOUND"}
    const renamedDay = await prisma.workoutDay.update({
        where:{id: dayId, workoutPlanId: planId},
        data:{name: name},
        select:{id: true, name: true, dayOrder: true, exercises: {select:{_count: {select:{sets: true}}}}}
    })
    return{ok:true, day: planDayDto(renamedDay)}
}

type DeleteDayResult =
    | { ok: true; days: PlanDay[]}
    | { ok: false; reason: "NOT_FOUND" | "CONFLICT"};

// Deletes the day, then renumbers the remaining days 1..n.
// Its exercises are deleted with it (Cascade); its past sessions stay, with no day (SetNull).
export async function deleteWorkoutDay(userId: string, planId: string, dayId: string): Promise<DeleteDayResult>
{
    const plan = await prisma.workoutPlan.findUnique({where:{id: planId, userId: userId}})
    const day = await prisma.workoutDay.findUnique({
        where:{id: dayId, workoutPlanId: planId}
    })
    if(!day || !plan)
        return {ok: false, reason: "NOT_FOUND"}
    try{
        // All or nothing: if one step fails, the day is not deleted.
        const remainingDays = await prisma.$transaction(async (tx) => {
            await tx.workoutDay.delete({where:{id: dayId}})
            const days = await tx.workoutDay.findMany({
                where:{workoutPlanId: planId},
                orderBy:{dayOrder: "asc"},
                select:{id: true}
            })
            // Lowest first, one day at a time: the new number is always free,
            // so @@unique([workoutPlanId, dayOrder]) never sees two days with the same number.
            for (const [index, d] of days.entries())
                await tx.workoutDay.update({where:{id: d.id}, data:{dayOrder: index + 1}})
            return tx.workoutDay.findMany({
                where:{workoutPlanId: planId},
                orderBy:{dayOrder: "asc"},
                select:{id: true, name: true, dayOrder: true, exercises: {select:{_count: {select:{sets: true}}}}}
            })
        })
        return {ok: true, days: remainingDays.map(planDayDto)}
    }catch(error){
        // Another request (e.g. add day) changed this plan's day numbers at the same time.
        if(isUniqueViolation(error))
            return({ok: false, reason:"CONFLICT"})
        throw error
    }
}


export async function renameWorkoutPlan(userId: string, planId: string, workoutPlan: CreateWorkoutPlanBody):Promise<PlanDetail|null>
{
    const plan =  await prisma.workoutPlan.findUnique({
        where:{userId: userId, id: planId}
    })
    if(!plan)
        return null
    const updatedPlan = await prisma.workoutPlan.update({
        where: {id: planId, userId: userId},
        data: {
            name: workoutPlan.name,
            description: workoutPlan.description
        },
        select:{
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
    return planDetailDto(updatedPlan)
}


// Deletes the plan with its days and their exercises (Cascade).
// Past sessions stay in the history, with no day (SetNull).
export async function deleteWorkoutPlan(userId: string, planId: string): Promise<boolean>
{
    const plan = await prisma.workoutPlan.findUnique({where:{id: planId, userId: userId}})
    if(!plan)
        return false
    await prisma.workoutPlan.delete({where:{id: planId, userId: userId}})
    return true
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
