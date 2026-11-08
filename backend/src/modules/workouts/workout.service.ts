import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";
import { MAX_DAYS_PER_PLAN, type WorkoutPlanBody } from "./workout.schema";
import type { DayDetail, DayExercise, PlanDay, PlanDetail, PlannedSet } from "./workout.types";
import { exerciseSummarySelect, toExerciseSummaryDto } from "./exercise-summary";
import { isNotFoundError, isUniqueViolation } from "./prisma-errors";

const planListSelect = {
    id: true,
    name: true,
    description: true,
    type: true,
    _count: { select: { days: true } },
} satisfies Prisma.WorkoutPlanSelect;

const daySelect = {
    id: true,
    name: true,
    dayOrder: true,
    exercises: { select: { _count: { select: { sets: true } } } },
} satisfies Prisma.WorkoutDaySelect;

const planDetailSelect = {
    id: true,
    name: true,
    description: true,
    type: true,
    days: { orderBy: { dayOrder: "asc" }, select: daySelect },
} satisfies Prisma.WorkoutPlanSelect;

const dayDetailSelect = {
    id: true,
    name: true,
    dayOrder: true,
    workoutPlan: { select: { id: true, name: true } },
    exercises: {
        orderBy: { order: "asc" },
        select: {
            id: true,
            order: true,
            restSeconds: true,
            exercise: { select: exerciseSummarySelect },
            sets: {
                orderBy: { setNumber: "asc" },
                select: {
                    id: true,
                    setNumber: true,
                    setType: true,
                    targetWeight: true,
                    targetReps: true,
                    targetDuration: true,
                    targetDistance: true,
                },
            },
        },
    },
} satisfies Prisma.WorkoutDaySelect;

type PlanRowDb = Prisma.WorkoutPlanGetPayload<{ select: typeof planListSelect }>;

type DayRowDb = Prisma.WorkoutDayGetPayload<{ select: typeof daySelect }>;

type PlanDetailRowDb = Prisma.WorkoutPlanGetPayload<{ select: typeof planDetailSelect }>;

type DayDetailRowDb = Prisma.WorkoutDayGetPayload<{ select: typeof dayDetailSelect }>;

type DayExerciseRowDb = DayDetailRowDb["exercises"][number];

type PlannedSetRowDb = DayExerciseRowDb["sets"][number];



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

function toPlannedSetDto(set: PlannedSetRowDb): PlannedSet
{
    return {
        id: set.id,
        setNumber: set.setNumber,
        setType: set.setType,
        targetWeight: set.targetWeight,
        targetReps: set.targetReps,
        targetDuration: set.targetDuration,
        targetDistance: set.targetDistance,
    }
}

function toDayExerciseDto(exercise: DayExerciseRowDb): DayExercise
{
    return {
        id: exercise.id,
        order: exercise.order,
        restSeconds: exercise.restSeconds,
        exerciseSummary: toExerciseSummaryDto(exercise.exercise),
        sets: exercise.sets.map(toPlannedSetDto),
    }
}

function toDayDetailDto(day: DayDetailRowDb): DayDetail
{
    return {
        id: day.id,
        name: day.name,
        dayOrder: day.dayOrder,
        planId: day.workoutPlan.id,
        planName: day.workoutPlan.name,
        exercises: day.exercises.map(toDayExerciseDto),
    }
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
        select: planListSelect
    });

    return fetchedWorkoutPlans.map(toWorkoutPlanDto);
}

export async function getWorkoutPlan(userId: string, planId: string):Promise<PlanDetail|null>
{
    const plan = await prisma.workoutPlan.findUnique({
        where: {
            userId: userId, id: planId
        },select: planDetailSelect
    })
    if(plan)
        return planDetailDto(plan)
    return null
}

export async function createWorkoutPlan(userId: string, workoutPlan: WorkoutPlanBody)
{
    const plan = await prisma.workoutPlan.create({
        data: { userId, ...workoutPlan },
        select: planListSelect,
    });

    return toWorkoutPlanDto(plan);
}

export async function updateWorkoutPlan(userId: string, planId: string, workoutPlan: WorkoutPlanBody):Promise<PlanDetail|null>
{
    try{
        const updatedPlan = await prisma.workoutPlan.update({
            where: {id: planId, userId: userId},
            data: {
                name: workoutPlan.name,
                description: workoutPlan.description
            },
            select: planDetailSelect
        })
        return planDetailDto(updatedPlan)
    }catch(error){
        if(isNotFoundError(error))
            return null
        throw error
    }
}


// Deletes the plan with its days and their exercises (Cascade).
// Past sessions stay in the history, with no day (SetNull).
export async function deleteWorkoutPlan(userId: string, planId: string): Promise<boolean>
{
    try{
        await prisma.workoutPlan.delete({where:{id: planId, userId: userId}})
        return true
    }catch(error){
        if(isNotFoundError(error))
            return false
        throw error
    }
}

export async function getWorkoutDay(userId: string, planId: string, dayId: string): Promise<DayDetail | null>
{
    const day = await prisma.workoutDay.findFirst({
        where: { id: dayId, workoutPlan: { id: planId, userId } },
        select: dayDetailSelect,
    })
    if(!day)
        return null
    return toDayDetailDto(day)
}

type CreateDayResult =
    | { ok: true; day: PlanDay}
    | { ok: false; reason: "NOT_FOUND" | "TOO_MANY_DAYS" | "CONFLICT"};

export async function createWorkoutDay(userId: string, planId: string, name: string): Promise<CreateDayResult>
{
    const plan = await prisma.workoutPlan.findUnique({
        where: { id: planId, userId },
        select: {
            _count: { select: { days: true } },
            days: { select: { dayOrder: true }, orderBy: { dayOrder: "desc" }, take: 1 },
        },
    })
    if (!plan) return { ok: false, reason: "NOT_FOUND" }
    if (plan._count.days >= MAX_DAYS_PER_PLAN) return { ok: false, reason: "TOO_MANY_DAYS" }
    try
    {
        const day = await prisma.workoutDay.create({
            data: { workoutPlanId: planId, name, dayOrder: (plan.days[0]?.dayOrder ?? 0) + 1 },
            select: daySelect,
        })
        return { ok: true, day: planDayDto(day) }
    }catch(error){
        if(isUniqueViolation(error))
            return({ok: false, reason:"CONFLICT"})
        throw error
    }
}


type RenameDayResult =
    | { ok: true; day: PlanDay }
    | { ok: false; reason: "NOT_FOUND" };

export async function renameWorkoutDay(userId: string, planId: string, dayId: string, name: string): Promise<RenameDayResult> {
    try{
        const renamedDay = await prisma.workoutDay.update({
            where:{id: dayId, workoutPlan: {id: planId, userId}},
            data:{name: name},
            select: daySelect
        })
        return{ok:true, day: planDayDto(renamedDay)}
    }catch(error){
        if(isNotFoundError(error))
            return {ok: false, reason: "NOT_FOUND"}
        throw error
    }
}

type DeleteDayResult =
    | { ok: true; days: PlanDay[]}
    | { ok: false; reason: "NOT_FOUND" | "CONFLICT"};

// Deletes the day, then renumbers the remaining days 1..n.
// Its exercises are deleted with it (Cascade); its past sessions stay, with no day (SetNull).
export async function deleteWorkoutDay(userId: string, planId: string, dayId: string): Promise<DeleteDayResult>
{
    try{
        // All or nothing: if one step fails, the day is not deleted.
        const remainingDays = await prisma.$transaction(async (tx) => {
            await tx.workoutDay.delete({where:{id: dayId, workoutPlan: {id: planId, userId}}})
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
                select: daySelect
            })
        })
        return {ok: true, days: remainingDays.map(planDayDto)}
    }catch(error){
        if(isNotFoundError(error))
            return {ok: false, reason: "NOT_FOUND"}
        // Another request (e.g. add day) changed this plan's day numbers at the same time.
        if(isUniqueViolation(error))
            return({ok: false, reason:"CONFLICT"})
        throw error
    }
}
