import { prisma } from "../../lib/prisma";
import type { Prisma } from "@prisma/client";
import { exerciseSummarySelect, toExerciseSummaryDto } from "../workouts/exercise-summary";
import { isNotFoundError } from "../workouts/prisma-errors";
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
