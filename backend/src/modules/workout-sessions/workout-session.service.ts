import { prisma } from "../../lib/prisma";
import type { ExerciseType, Prisma } from "@prisma/client";
import { exerciseSummarySelect, toExerciseSummaryDto } from "../exercises/exercise-summary";
import { isNotFoundError, isUniqueViolation, isWriteConflict } from "../../lib/prisma-errors";
import { MAX_WORKOUTS_PER_DAY, type UpdateSetBody } from "./workout-session.schema";
import { MAX_EXERCISES, MAX_SETS_PER_EXERCISE } from "../../lib/validation";
import type { AwardResult, WorkoutSession, WorkoutSessionExercise, WorkoutSessionSet, WorkoutSummary } from "./workout-session.types";
import { award, type AwardEvent } from "../progress/progress.service";

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
    isPr: true,
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

function toSessionExerciseDto(exercise: SessionExerciseRowDb, previousBest: number | null): WorkoutSessionExercise
{
    return {
        id: exercise.id,
        order: exercise.order,
        exerciseSummary: toExerciseSummaryDto(exercise.exercise),
        restSeconds: exercise.restSeconds,
        previousBest,
        sets: exercise.sets.map(toSessionSetDto),
    }
}

// S3 -> S5 contract ("Workout results"): only a finished workout has a summary.
// Volume counts completed sets that have both a weight and reps.
function toSummaryDto(session: SessionRowDb): WorkoutSummary | null
{
    if(session.status !== "COMPLETED" || !session.completedAt)
        return null
    const sets = session.exercises.flatMap(exercise => exercise.sets)
    const completed = sets.filter(set => set.completedAt !== null)
    return {
        durationSeconds: Math.max(0, Math.floor((session.completedAt.getTime() - session.startedAt.getTime()) / 1000)),
        setsCompleted: completed.length,
        setsTotal: sets.length,
        volumeKg: completed.reduce((total, set) =>
            set.weight !== null && set.reps !== null ? total + set.weight * set.reps : total, 0),
        exerciseCount: session.exercises.length,
        prSetIds: completed.filter(set => set.isPr).map(set => set.id),
    }
}

function toSessionDto(session: SessionRowDb, previousBest: Map<string, number>): WorkoutSession
{
    return {
        id: session.id,
        name: session.workoutDay?.name ?? "Workout",
        workoutDayId: session.workoutDayId,
        status: session.status,
        startedAt: session.startedAt.toISOString(),
        completedAt: session.completedAt?.toISOString() ?? null,
        bodyWeightKg: session.bodyWeightKg,
        exercises: session.exercises.map(exercise =>
            toSessionExerciseDto(exercise, previousBest.get(exercise.exercise.id) ?? null)),
        summary: toSummaryDto(session),
    }
}

// Epley formula. One rep is the lift itself, so it is not estimated.
function estimateOneRepMax(weight: number, reps: number): number
{
    if(reps === 1)
        return weight
    return weight * (1 + reps / 30)
}

type PrCandidate = { id: string; exerciseId: string; weight: number; reps: number };

// The highest estimate per exercise. On a tie the first set in the list keeps it.
function bestPerExercise(sets: PrCandidate[]): Map<string, { setId: string; estimate: number }>
{
    const best = new Map<string, { setId: string; estimate: number }>()
    for (const set of sets)
    {
        const estimate = estimateOneRepMax(set.weight, set.reps)
        const current = best.get(set.exerciseId)
        if(!current || estimate > current.estimate)
            best.set(set.exerciseId, { setId: set.id, estimate })
    }
    return best
}

// A one-rep max needs a weight and reps; only these types record both.
const PR_EXERCISE_TYPES: ExerciseType[] = ["WEIGHT_REPS", "WEIGHTED_BODYWEIGHT"]

// exerciseId comes from the saved row, never from the request.
const prSetSelect = {
    id: true,
    weight: true,
    reps: true,
    workoutSessionExercise: { select: { exerciseId: true } },
} satisfies Prisma.WorkoutSetSelect;

type PrSetRowDb = Prisma.WorkoutSetGetPayload<{ select: typeof prSetSelect }>;

// Ticked sets with a weight and reps, of a type that can have a PR.
// The caller says which workouts and exercises to look in.
function prSetWhere(sessionExercise: Prisma.WorkoutSessionExerciseWhereInput)
{
    return {
        completedAt: { not: null },
        weight: { not: null },
        reps: { not: null },
        workoutSessionExercise: { ...sessionExercise, exercise: { type: { in: PR_EXERCISE_TYPES } } },
    } satisfies Prisma.WorkoutSetWhereInput
}

// prSetWhere already drops null weight and reps; the check here is for the types.
function toPrCandidates(rows: PrSetRowDb[]): PrCandidate[]
{
    return rows.flatMap(row => row.weight === null || row.reps === null ? [] : [{
        id: row.id,
        exerciseId: row.workoutSessionExercise.exerciseId,
        weight: row.weight,
        reps: row.reps,
    }])
}

// Best estimate per exercise in this user's finished workouts, excludeSessionId left out.
// One query for all the exercises. An exercise with no earlier set is not in the map.
async function getPreviousBestByExercise(tx: Prisma.TransactionClient, userId: string, exerciseIds: string[], excludeSessionId: string): Promise<Map<string, number>>
{
    if(exerciseIds.length === 0)
        return new Map()
    const rows = await tx.workoutSet.findMany({
        where: prSetWhere({
            exerciseId: { in: exerciseIds },
            workoutSession: { userId, status: "COMPLETED", id: { not: excludeSessionId } },
        }),
        select: prSetSelect,
    })
    const previousBest = new Map<string, number>()
    for (const [exerciseId, best] of bestPerExercise(toPrCandidates(rows)))
        previousBest.set(exerciseId, best.estimate)
    return previousBest
}

// Every response with a whole workout goes through here, so previousBest costs
// one query per response, not one per exercise.
async function buildSessionDto(tx: Prisma.TransactionClient, userId: string, session: SessionRowDb): Promise<WorkoutSession>
{
    const exerciseIds = session.exercises.map(exercise => exercise.exercise.id)
    const previousBest = await getPreviousBestByExercise(tx, userId, exerciseIds, session.id)
    return toSessionDto(session, previousBest)
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
    return buildSessionDto(prisma, userId, session)
}

type DiscardResult =
    | { ok: true }
    | { ok: false; reason: "NOT_FOUND" | "CLOSED" };

// Deletes the workout with its exercises and sets (Cascade). Only a workout in progress
// can be discarded, so a finished one stays in the history.
// CANCELLED is no longer written; rows discarded before this change keep it.
export async function discardWorkoutSession(userId: string, sessionId: string): Promise<DiscardResult>
{
    const state = await getSessionState(userId, sessionId)
    if(state !== "OPEN")
        return { ok: false, reason: state }
    try{
        await prisma.workoutSession.delete({
            where: { id: sessionId, userId, status: "IN_PROGRESS" },
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
        const previousBest = await getPreviousBestByExercise(prisma, userId, exerciseIds, sessionId)
        return {
            ok: true,
            exercises: created.map(exercise =>
                toSessionExerciseDto(exercise, previousBest.get(exercise.exercise.id) ?? null)),
        }
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

// Locks this user's workout row until the transaction ends, only while it is IN_PROGRESS.
// Finish and the set writes take it first, so they run one after the other: a tick can't
// change a workout that is being finished, and finish counts the sets after the tick.
// After waiting, PostgreSQL checks the status again, so a workout finished meanwhile
// returns false. Same lock as award() takes on the User row in progress.service.ts.
async function lockOpenSession(tx: Prisma.TransactionClient, userId: string, sessionId: string): Promise<boolean>
{
    const rows = await tx.$queryRaw<{ id: string }[]>`
        SELECT "id" FROM "WorkoutSession"
        WHERE "id" = ${sessionId} AND "userId" = ${userId} AND "status" = 'IN_PROGRESS'
        FOR UPDATE
    `
    return rows.length > 0
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
        return await prisma.$transaction(async (tx): Promise<UpdateSetResult> => {
            // Finished or discarded since the check above.
            if(!await lockOpenSession(tx, userId, sessionId))
                return { ok: false, reason: "NOT_FOUND" }
            const set = await tx.workoutSet.findFirst({
                where: openSetWhere(userId, sessionId, setId),
                select: { completedAt: true },
            })
            if(!set)
                return { ok: false, reason: "SET_NOT_FOUND" }
            // undefined keeps the value, null clears it.
            // Ticking an already ticked set keeps its first completedAt.
            let completedAt: Date | null | undefined = undefined
            if(patch.completed === true)
                completedAt = set.completedAt ?? new Date()
            else if(patch.completed === false)
                completedAt = null
            const updated = await tx.workoutSet.update({
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
            return { ok: true, set: toSessionSetDto(updated) }
        })
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
        return await prisma.$transaction(async (tx): Promise<DeleteSetResult> => {
            // Finished or discarded since the check above.
            if(!await lockOpenSession(tx, userId, sessionId))
                return { ok: false, reason: "NOT_FOUND" }
            const set = await tx.workoutSet.findFirst({
                where: openSetWhere(userId, sessionId, setId),
                select: { workoutSessionExerciseId: true },
            })
            if(!set)
                return { ok: false, reason: "SET_NOT_FOUND" }
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
            return { ok: true }
        })
    }catch(error){
        if(isNotFoundError(error))
            return { ok: false, reason: "NOT_FOUND" }
        // Another request (e.g. add set) changed this exercise's set numbers at the same time.
        if(isUniqueViolation(error))
            return { ok: false, reason: "CONFLICT" }
        throw error
    }
}

type FinishSessionResult =
    | { ok: true; session: WorkoutSession; award: AwardResult | null }
    | { ok: false; reason: "NOT_FOUND" | "CANCELLED" | "NO_COMPLETED_SET" };

// Finishing twice returns the finished workout again with award null,
// so a retry or a double click is not an error and is not paid twice.
export async function finishWorkoutSession(userId: string, sessionId: string): Promise<FinishSessionResult>
{
    const current = await getWorkoutSession(userId, sessionId)
    if(!current)
        return { ok: false, reason: "NOT_FOUND" }
    if(current.status === "CANCELLED")
        return { ok: false, reason: "CANCELLED" }
    if(current.status === "COMPLETED")
        return { ok: true, session: current, award: null }
    if(!current.exercises.some(exercise => exercise.sets.some(set => set.completedAt !== null)))
        return { ok: false, reason: "NO_COMPLETED_SET" }
    // All or nothing: the status, the PR flags and the award are saved together.
    // null: another request finished or discarded the workout after the checks above.
    const finished = await prisma.$transaction(async (tx): Promise<FinishSessionResult | null> => {
        // Of two finishes sent together, the second waits here for the first to commit.
        if(!await lockOpenSession(tx, userId, sessionId))
            return null
        // Counted again under the lock: a set unticked or deleted after the check above counts.
        const ticked = await tx.workoutSet.count({
            where: { completedAt: { not: null }, workoutSessionExercise: { workoutSessionId: sessionId } },
        })
        if(ticked === 0)
            return { ok: false, reason: "NO_COMPLETED_SET" }
        await tx.workoutSession.update({
            where: { id: sessionId, userId, status: "IN_PROGRESS" },
            data: { status: "COMPLETED", completedAt: new Date() },
            select: { id: true },
        })
        const todaySets = await tx.workoutSet.findMany({
            where: prSetWhere({ workoutSession: { id: sessionId, userId } }),
            orderBy: [{ workoutSessionExercise: { order: "asc" } }, { setNumber: "asc" }],
            select: prSetSelect,
        })
        const todayBest = bestPerExercise(toPrCandidates(todaySets))
        const previousBest = await getPreviousBestByExercise(tx, userId, [...todayBest.keys()], sessionId)
        // A PR beats an earlier best, so the first time an exercise is done is not one.
        const prSetIds: string[] = []
        for (const [exerciseId, best] of todayBest)
        {
            const previous = previousBest.get(exerciseId)
            if(previous !== undefined && best.estimate > previous)
                prSetIds.push(best.setId)
        }
        if(prSetIds.length > 0)
            await tx.workoutSet.updateMany({ where: { id: { in: prSetIds } }, data: { isPr: true } })
        const events: AwardEvent[] = [
            { reason: "WORKOUT_COMPLETED", sourceId: sessionId },
            ...prSetIds.map((setId): AwardEvent => ({ reason: "PR_SET", sourceId: setId })),
        ]
        const awarded = await award(tx, userId, events)
        const session = await tx.workoutSession.findUniqueOrThrow({
            where: { id: sessionId },
            select: sessionSelect,
        })
        return { ok: true, session: await buildSessionDto(tx, userId, session), award: awarded }
    })
    if(finished)
        return finished
    const session = await getWorkoutSession(userId, sessionId)
    if(session?.status === "COMPLETED")
        return { ok: true, session, award: null }
    return { ok: false, reason: "NOT_FOUND" }
}

const daySnapshotSelect = {
    exercises: {
        orderBy: { order: "asc" },
        select: {
            exerciseId: true,
            order: true,
            restSeconds: true,
            sets: {
                orderBy: { setNumber: "asc" },
                select: { setNumber: true, setType: true, targetWeight: true, targetReps: true, targetDuration: true, targetDistance: true },
            },
        },
    },
} satisfies Prisma.WorkoutDaySelect;

type StartSessionResult =
    | { ok: true; session: WorkoutSession }
    | { ok: false; reason: "ACTIVE"; activeSessionId: string }
    | { ok: false; reason: "DAILY_LIMIT" | "DAY_NOT_FOUND" | "CONFLICT" };

const DAY_MS = 24 * 60 * 60 * 1000

// No dayId starts an empty workout. With a dayId, the day's exercises and sets are copied
// (targets become planned* values), so later plan edits never change this workout.
export async function startWorkoutSession(userId: string, dayId: string | undefined): Promise<StartSessionResult>
{
    try{
        // Serializable: two starts sent at the same moment both read "no active workout";
        // PostgreSQL then rolls one of them back (P2034) instead of saving two.
        return await prisma.$transaction(async (tx): Promise<StartSessionResult> => {
            const active = await tx.workoutSession.findFirst({
                where: { userId, status: "IN_PROGRESS" },
                select: { id: true },
            })
            if(active)
                return { ok: false, reason: "ACTIVE", activeSessionId: active.id }
            const startedToday = await tx.workoutSession.count({
                where: { userId, startedAt: { gte: new Date(Date.now() - DAY_MS) } },
            })
            if(startedToday >= MAX_WORKOUTS_PER_DAY)
                return { ok: false, reason: "DAILY_LIMIT" }
            const day = dayId === undefined ? null : await tx.workoutDay.findFirst({
                where: { id: dayId, workoutPlan: { userId } },
                select: daySnapshotSelect,
            })
            if(dayId !== undefined && !day)
                return { ok: false, reason: "DAY_NOT_FOUND" }
            const session = await tx.workoutSession.create({
                data: {
                    userId,
                    workoutDayId: dayId,
                    exercises: {
                        create: (day?.exercises ?? []).map(exercise => ({
                            exerciseId: exercise.exerciseId,
                            order: exercise.order,
                            restSeconds: exercise.restSeconds,
                            sets: {
                                createMany: {
                                    data: exercise.sets.map(set => ({
                                        setNumber: set.setNumber,
                                        setType: set.setType,
                                        plannedWeight: set.targetWeight,
                                        plannedReps: set.targetReps,
                                        plannedDuration: set.targetDuration,
                                        plannedDistance: set.targetDistance,
                                    })),
                                },
                            },
                        })),
                    },
                },
                select: sessionSelect,
            })
            return { ok: true, session: await buildSessionDto(tx, userId, session) }
        }, { isolationLevel: "Serializable" })
    }catch(error){
        if(isWriteConflict(error))
            return { ok: false, reason: "CONFLICT" }
        throw error
    }
}

type MoveExerciseResult =
    | { ok: true; exerciseIds: string[] }
    | { ok: false; reason: "NOT_FOUND" | "CLOSED" | "EXERCISE_NOT_FOUND" | "ALREADY_FIRST" | "ALREADY_LAST" | "CONFLICT" };

// Swaps order with the neighbour and returns the exercise ids in their new order.
// order is unique per workout, so the moved exercise waits at 0 while the neighbour takes its place.
export async function moveSessionExercise(userId: string, sessionId: string, exerciseId: string, direction: -1 | 1): Promise<MoveExerciseResult>
{
    const state = await getSessionState(userId, sessionId)
    if(state !== "OPEN")
        return { ok: false, reason: state }
    try{
        return await prisma.$transaction(async (tx): Promise<MoveExerciseResult> => {
            const exercises = await tx.workoutSessionExercise.findMany({
                where: { workoutSession: { id: sessionId, userId, status: "IN_PROGRESS" } },
                orderBy: { order: "asc" },
                select: { id: true, order: true },
            })
            const index = exercises.findIndex(exercise => exercise.id === exerciseId)
            if(index === -1)
                return { ok: false, reason: "EXERCISE_NOT_FOUND" }
            const current = exercises[index]
            const neighbour = exercises[index + direction]
            if(!neighbour)
                return { ok: false, reason: direction === -1 ? "ALREADY_FIRST" : "ALREADY_LAST" }
            await tx.workoutSessionExercise.update({ where: { id: current.id }, data: { order: 0 } })
            await tx.workoutSessionExercise.update({ where: { id: neighbour.id }, data: { order: current.order } })
            await tx.workoutSessionExercise.update({ where: { id: current.id }, data: { order: neighbour.order } })
            const ids = exercises.map(exercise => exercise.id)
            ids[index] = neighbour.id
            ids[index + direction] = current.id
            return { ok: true, exerciseIds: ids }
        })
    }catch(error){
        // Another move or add changed this workout's order at the same time.
        if(isUniqueViolation(error))
            return { ok: false, reason: "CONFLICT" }
        throw error
    }
} 
