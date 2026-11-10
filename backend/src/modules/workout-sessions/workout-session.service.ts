import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";
import { exerciseSummarySelect, toExerciseSummaryDto } from "../exercises/exercise-summary";
import { isNotFoundError, isUniqueViolation } from "../../lib/prisma-errors";
import type { UpdateSetBody } from "./workout-session.schema";
import { MAX_EXERCISES, MAX_SETS_PER_EXERCISE } from "../../lib/validation";
import type { WorkoutSession, WorkoutSessionExercise, WorkoutSessionSet } from "./workout-session.types";

const setSelect = {
    id: true,
    setType: true,
    setNumber: true,
    plannedWeight: true,
    plannedReps: true,
    plannedDuration: true,
    plannedDistance: true,
    weight: true,
    reps: true,
    duration: true,
    distance: true,
    completedAt: true,
} satisfies Prisma.WorkoutSetSelect;

const sessionExerciseSelect = {
    id: true,
    order: true,
    restSeconds: true,
    exercise: { select: exerciseSummarySelect },
    sets: { orderBy: { setNumber: "asc" }, select: setSelect },
} satisfies Prisma.WorkoutSessionExerciseSelect;

const sessionSelect = {
    id: true,
    workoutDayId: true,
    status: true,
    startedAt: true,
    completedAt: true,
    bodyWeightKg: true,
    workoutDay: { select: { name: true } },
    exercises: { orderBy: { order: "asc" }, select: sessionExerciseSelect },
} satisfies Prisma.WorkoutSessionSelect;

type SetRowDb = Prisma.WorkoutSetGetPayload<{ select: typeof setSelect }>;

type SessionExerciseRowDb = Prisma.WorkoutSessionExerciseGetPayload<{ select: typeof sessionExerciseSelect }>;

type SessionRowDb = Prisma.WorkoutSessionGetPayload<{ select: typeof sessionSelect }>;

function toSessionSetDto(set: SetRowDb): WorkoutSessionSet
{
    return {
        id: set.id,
        setType: set.setType,
        setNumber: set.setNumber,
        plannedWeight: set.plannedWeight,
        plannedReps: set.plannedReps,
        plannedDuration: set.plannedDuration,
        plannedDistance: set.plannedDistance,
        weight: set.weight,
        reps: set.reps,
        duration: set.duration,
        distance: set.distance,
        completedAt: set.completedAt?.toISOString() ?? null,
    }
}

function toSessionExerciseDto(exercise: SessionExerciseRowDb): WorkoutSessionExercise
{
    return {
        id: exercise.id,
        order: exercise.order,
        exerciseSummary: toExerciseSummaryDto(exercise.exercise),
        restSeconds: exercise.restSeconds,
        sets: exercise.sets.map(toSessionSetDto),
    }
}

function toSessionDto(session: SessionRowDb): WorkoutSession
{
    return {
        id: session.id,
        name: session.workoutDay?.name ?? "Workout",
        workoutDayId: session.workoutDayId,
        status: session.status,
        startedAt: session.startedAt.toISOString(),
        completedAt: session.completedAt?.toISOString() ?? null,
        bodyWeightKg: session.bodyWeightKg,
        exercises: session.exercises.map(toSessionExerciseDto),
        // The summary is added with POST /:sessionId/finish.
        summary: null,
    }
}

type SessionState = "NOT_FOUND" | "CLOSED" | "OPEN";

// Every write checks this first, then repeats status: "IN_PROGRESS" in its own where,
// so a workout finished between the two queries is never changed.
async function getSessionState(userId: string, sessionId: string): Promise<SessionState>
{
    const session = await prisma.workoutSession.findFirst({
        where: { id: sessionId, userId },
        select: { status: true },
    })
    if(!session)
        return "NOT_FOUND"
    if(session.status !== "IN_PROGRESS")
        return "CLOSED"
    return "OPEN"
}

export async function getWorkoutSession(userId: string, sessionId: string): Promise<WorkoutSession | null>
{
    const session = await prisma.workoutSession.findFirst({
        where: { id: sessionId, userId },
        select: sessionSelect,
    })
    if(!session)
        return null
    return toSessionDto(session)
}

type DiscardResult =
    | { ok: true }
    | { ok: false; reason: "NOT_FOUND" | "CLOSED" };

export async function discardWorkoutSession(userId: string, sessionId: string): Promise<DiscardResult>
{
    const state = await getSessionState(userId, sessionId)
    if(state !== "OPEN")
        return { ok: false, reason: state }
    try{
        await prisma.workoutSession.update({
            where: { id: sessionId, userId, status: "IN_PROGRESS" },
            data: { status: "CANCELLED" },
        })
        return { ok: true }
    }catch(error){
        if(isNotFoundError(error))
            return { ok: false, reason: "NOT_FOUND" }
        throw error
    }
}

type AddExercisesResult =
    | { ok: true; exercises: WorkoutSessionExercise[] }
    | { ok: false; reason: "NOT_FOUND" | "CLOSED" | "TOO_MANY_EXERCISES" | "EXERCISE_NOT_FOUND" | "CONFLICT" };

// Adds the exercises after the last one, in the given order, each with one empty set.
export async function addSessionExercises(userId: string, sessionId: string, exerciseIds: string[]): Promise<AddExercisesResult>
{
    const state = await getSessionState(userId, sessionId)
    if(state !== "OPEN")
        return { ok: false, reason: state }
    const existing = await prisma.workoutSessionExercise.count({ where: { workoutSessionId: sessionId } })
    if(existing + exerciseIds.length > MAX_EXERCISES)
        return { ok: false, reason: "TOO_MANY_EXERCISES" }
    const found = await prisma.exercise.count({ where: { id: { in: exerciseIds } } })
    if(found !== exerciseIds.length)
        return { ok: false, reason: "EXERCISE_NOT_FOUND" }
    try{
        const created = await prisma.$transaction(async (tx) => {
            const last = await tx.workoutSessionExercise.findFirst({
                where: { workoutSessionId: sessionId },
                orderBy: { order: "desc" },
                select: { order: true },
            })
            const highest = last?.order ?? 0
            const exercises: SessionExerciseRowDb[] = []
            for (const [index, exerciseId] of exerciseIds.entries())
            {
                exercises.push(await tx.workoutSessionExercise.create({
                    data: {
                        // connect fails (P2025) if the workout was finished in between.
                        workoutSession: { connect: { id: sessionId, userId, status: "IN_PROGRESS" } },
                        exercise: { connect: { id: exerciseId } },
                        order: highest + 1 + index,
                        sets: { create: { setNumber: 1, setType: "NORMAL" } },
                    },
                    select: sessionExerciseSelect,
                }))
            }
            return exercises
        })
        return { ok: true, exercises: created.map(toSessionExerciseDto) }
    }catch(error){
        if(isNotFoundError(error))
            return { ok: false, reason: "NOT_FOUND" }
        // Another request added an exercise to this workout at the same time.
        if(isUniqueViolation(error))
            return { ok: false, reason: "CONFLICT" }
        throw error
    }
}

type AddSetResult =
    | { ok: true; set: WorkoutSessionSet }
    | { ok: false; reason: "NOT_FOUND" | "CLOSED" | "EXERCISE_NOT_FOUND" | "TOO_MANY_SETS" | "CONFLICT" };

export async function addSessionSet(userId: string, sessionId: string, exerciseId: string): Promise<AddSetResult>
{
    const state = await getSessionState(userId, sessionId)
    if(state !== "OPEN")
        return { ok: false, reason: state }
    const openExercise = { id: exerciseId, workoutSession: { id: sessionId, userId, status: "IN_PROGRESS" } } satisfies Prisma.WorkoutSessionExerciseWhereInput
    const exercise = await prisma.workoutSessionExercise.findFirst({
        where: openExercise,
        select: {
            _count: { select: { sets: true } },
            sets: { orderBy: { setNumber: "desc" }, take: 1, select: { setNumber: true } },
        },
    })
    if(!exercise)
        return { ok: false, reason: "EXERCISE_NOT_FOUND" }
    if(exercise._count.sets >= MAX_SETS_PER_EXERCISE)
        return { ok: false, reason: "TOO_MANY_SETS" }
    try{
        const set = await prisma.workoutSet.create({
            data: {
                workoutSessionExercise: { connect: openExercise },
                setNumber: (exercise.sets[0]?.setNumber ?? 0) + 1,
            },
            select: setSelect,
        })
        return { ok: true, set: toSessionSetDto(set) }
    }catch(error){
        if(isNotFoundError(error))
            return { ok: false, reason: "NOT_FOUND" }
        if(isUniqueViolation(error))
            return { ok: false, reason: "CONFLICT" }
        throw error
    }
}

// A set of this user's workout that is still in progress.
function openSetWhere(userId: string, sessionId: string, setId: string)
{
    return {
        id: setId,
        workoutSessionExercise: { workoutSession: { id: sessionId, userId, status: "IN_PROGRESS" } },
    } satisfies Prisma.WorkoutSetWhereInput
}

type UpdateSetResult =
    | { ok: true; set: WorkoutSessionSet }
    | { ok: false; reason: "NOT_FOUND" | "CLOSED" | "SET_NOT_FOUND" };

export async function updateSessionSet(userId: string, sessionId: string, setId: string, patch: UpdateSetBody): Promise<UpdateSetResult>
{
    const state = await getSessionState(userId, sessionId)
    if(state !== "OPEN")
        return { ok: false, reason: state }
    try{
        const updated = await prisma.$transaction(async (tx) => {
            const set = await tx.workoutSet.findFirst({
                where: openSetWhere(userId, sessionId, setId),
                select: { completedAt: true },
            })
            if(!set)
                return null
            // undefined keeps the value, null clears it.
            // Ticking an already ticked set keeps its first completedAt.
            let completedAt: Date | null | undefined = undefined
            if(patch.completed === true)
                completedAt = set.completedAt ?? new Date()
            else if(patch.completed === false)
                completedAt = null
            return tx.workoutSet.update({
                where: openSetWhere(userId, sessionId, setId),
                data: {
                    weight: patch.weight,
                    reps: patch.reps,
                    duration: patch.duration,
                    distance: patch.distance,
                    setType: patch.setType,
                    completedAt,
                },
                select: setSelect,
            })
        })
        if(!updated)
            return { ok: false, reason: "SET_NOT_FOUND" }
        return { ok: true, set: toSessionSetDto(updated) }
    }catch(error){
        if(isNotFoundError(error))
            return { ok: false, reason: "NOT_FOUND" }
        throw error
    }
}

type DeleteSetResult =
    | { ok: true }
    | { ok: false; reason: "NOT_FOUND" | "CLOSED" | "SET_NOT_FOUND" | "CONFLICT" };

// Deletes the set, then renumbers the exercise's remaining sets 1..n.
export async function deleteSessionSet(userId: string, sessionId: string, setId: string): Promise<DeleteSetResult>
{
    const state = await getSessionState(userId, sessionId)
    if(state !== "OPEN")
        return { ok: false, reason: state }
    try{
        // All or nothing: if one step fails, the set is not deleted.
        const deleted = await prisma.$transaction(async (tx) => {
            const set = await tx.workoutSet.findFirst({
                where: openSetWhere(userId, sessionId, setId),
                select: { workoutSessionExerciseId: true },
            })
            if(!set)
                return false
            await tx.workoutSet.delete({ where: openSetWhere(userId, sessionId, setId) })
            const sets = await tx.workoutSet.findMany({
                where: { workoutSessionExerciseId: set.workoutSessionExerciseId },
                orderBy: { setNumber: "asc" },
                select: { id: true },
            })
            // Lowest first, one set at a time: the new number is always free,
            // so @@unique([workoutSessionExerciseId, setNumber]) never sees two sets with the same number.
            for (const [index, s] of sets.entries())
                await tx.workoutSet.update({ where: { id: s.id }, data: { setNumber: index + 1 } })
            return true
        })
        if(!deleted)
            return { ok: false, reason: "SET_NOT_FOUND" }
        return { ok: true }
    }catch(error){
        if(isNotFoundError(error))
            return { ok: false, reason: "NOT_FOUND" }
        // Another request (e.g. add set) changed this exercise's set numbers at the same time.
        if(isUniqueViolation(error))
            return { ok: false, reason: "CONFLICT" }
        throw error
    }
}
