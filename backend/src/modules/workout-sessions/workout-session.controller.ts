import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import { addSessionExercises, addSessionSet, deleteSessionSet, discardWorkoutSession, finishWorkoutSession, getWorkoutSession, moveSessionExercise, startWorkoutSession, updateSessionSet } from "./workout-session.service";
import { MAX_WORKOUTS_PER_DAY, addExercisesBody, moveExerciseBody, startSessionBody, updateSetBody } from "./workout-session.schema";
import { MAX_EXERCISES, MAX_SETS_PER_EXERCISE, idParam } from "../../lib/validation";
import type { FinishWorkoutResponse } from "./workout-session.types";

// Express types every param as string | string[]; a named :param is always one string.
type SessionRequest = AuthenticatedRequest & { params: { sessionId: string } };
type SessionExerciseRequest = AuthenticatedRequest & { params: { sessionId: string; exerciseId: string } };
type SessionSetRequest = AuthenticatedRequest & { params: { sessionId: string; setId: string } };

export async function getWorkoutSessionController(req: SessionRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    if(!idParam.safeParse(req.params.sessionId).success) return res.status(404).json({message: "Workout not found."})
    try{
        const session = await getWorkoutSession(req.userId, req.params.sessionId)
        if(!session)
            return res.status(404).json({message: "Workout not found."})
        return res.status(200).json(session)
    }catch(error){
        console.error("GET /api/workout-sessions/:sessionId failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function discardWorkoutSessionController(req: SessionRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    if(!idParam.safeParse(req.params.sessionId).success) return res.status(404).json({message: "Workout not found."})
    try{
        const result = await discardWorkoutSession(req.userId, req.params.sessionId)
        if(!result.ok)
        {
            if(result.reason === "NOT_FOUND")
                return res.status(404).json({message: "Workout not found."})
            return res.status(409).json({message: "This workout is finished or cancelled."})
        }
        return res.status(204).send()
    }catch(error){
        console.error("DELETE /api/workout-sessions/:sessionId failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function addSessionExercisesController(req: SessionRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    if(!idParam.safeParse(req.params.sessionId).success) return res.status(404).json({message: "Workout not found."})
    const parsed = addExercisesBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const result = await addSessionExercises(req.userId, req.params.sessionId, parsed.data.exerciseIds)
        if(!result.ok)
        {
            if(result.reason === "NOT_FOUND")
                return res.status(404).json({message: "Workout not found."})
            if(result.reason === "CLOSED")
                return res.status(409).json({message: "This workout is finished or cancelled."})
            if(result.reason === "TOO_MANY_EXERCISES")
                return res.status(422).json({message: `A workout can have at most ${MAX_EXERCISES} exercises.`})
            if(result.reason === "EXERCISE_NOT_FOUND")
                return res.status(404).json({message: "Exercise not found."})
            return res.status(409).json({message: "The workout changed. Please try again."})
        }
        return res.status(201).json(result.exercises)
    }catch(error){
        console.error("POST /api/workout-sessions/:sessionId/exercises failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function addSessionSetController(req: SessionExerciseRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    if(!idParam.safeParse(req.params.sessionId).success) return res.status(404).json({message: "Workout not found."})
    if(!idParam.safeParse(req.params.exerciseId).success) return res.status(404).json({message: "Exercise not found."})
    try{
        const result = await addSessionSet(req.userId, req.params.sessionId, req.params.exerciseId)
        if(!result.ok)
        {
            if(result.reason === "NOT_FOUND")
                return res.status(404).json({message: "Workout not found."})
            if(result.reason === "CLOSED")
                return res.status(409).json({message: "This workout is finished or cancelled."})
            if(result.reason === "EXERCISE_NOT_FOUND")
                return res.status(404).json({message: "Exercise not found."})
            if(result.reason === "TOO_MANY_SETS")
                return res.status(422).json({message: `An exercise can have at most ${MAX_SETS_PER_EXERCISE} sets.`})
            return res.status(409).json({message: "The workout changed. Please try again."})
        }
        return res.status(201).json(result.set)
    }catch(error){
        console.error("POST /api/workout-sessions/:sessionId/exercises/:exerciseId/sets failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function updateSessionSetController(req: SessionSetRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    if(!idParam.safeParse(req.params.sessionId).success) return res.status(404).json({message: "Workout not found."})
    if(!idParam.safeParse(req.params.setId).success) return res.status(404).json({message: "Set not found."})
    const parsed = updateSetBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const result = await updateSessionSet(req.userId, req.params.sessionId, req.params.setId, parsed.data)
        if(!result.ok)
        {
            if(result.reason === "NOT_FOUND")
                return res.status(404).json({message: "Workout not found."})
            if(result.reason === "CLOSED")
                return res.status(409).json({message: "This workout is finished or cancelled."})
            return res.status(404).json({message: "Set not found."})
        }
        return res.status(200).json(result.set)
    }catch(error){
        console.error("PATCH /api/workout-sessions/:sessionId/sets/:setId failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function deleteSessionSetController(req: SessionSetRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    if(!idParam.safeParse(req.params.sessionId).success) return res.status(404).json({message: "Workout not found."})
    if(!idParam.safeParse(req.params.setId).success) return res.status(404).json({message: "Set not found."})
    try{
        const result = await deleteSessionSet(req.userId, req.params.sessionId, req.params.setId)
        if(!result.ok)
        {
            if(result.reason === "NOT_FOUND")
                return res.status(404).json({message: "Workout not found."})
            if(result.reason === "CLOSED")
                return res.status(409).json({message: "This workout is finished or cancelled."})
            if(result.reason === "SET_NOT_FOUND")
                return res.status(404).json({message: "Set not found."})
            return res.status(409).json({message: "The workout changed. Please try again."})
        }
        return res.status(204).send()
    }catch(error){
        console.error("DELETE /api/workout-sessions/:sessionId/sets/:setId failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function startWorkoutSessionController(req: AuthenticatedRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    const parsed = startSessionBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const result = await startWorkoutSession(req.userId, parsed.data.dayId)
        if(!result.ok)
        {
            // The id lets the client offer to resume or discard the running workout.
            if(result.reason === "ACTIVE")
                return res.status(409).json({message: "You have a workout in progress.", activeSessionId: result.activeSessionId})
            if(result.reason === "DAILY_LIMIT")
                return res.status(422).json({message: `You can start at most ${MAX_WORKOUTS_PER_DAY} workouts in 24 hours.`})
            if(result.reason === "DAY_NOT_FOUND")
                return res.status(404).json({message: "Day not found."})
            return res.status(409).json({message: "Another workout was started at the same time. Please try again."})
        }
        return res.status(201).json(result.session)
    }catch(error){
        console.error("POST /api/workout-sessions failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function finishWorkoutSessionController(req: SessionRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    if(!idParam.safeParse(req.params.sessionId).success) return res.status(404).json({message: "Workout not found."})
    try{
        const result = await finishWorkoutSession(req.userId, req.params.sessionId)
        if(!result.ok)
        {
            if(result.reason === "NOT_FOUND")
                return res.status(404).json({message: "Workout not found."})
            if(result.reason === "CANCELLED")
                return res.status(409).json({message: "This workout was discarded."})
            return res.status(422).json({message: "Complete at least one set to finish."})
        }
        const body: FinishWorkoutResponse = { session: result.session, award: result.award }
        return res.status(200).json(body)
    }catch(error){
        console.error("POST /api/workout-sessions/:sessionId/finish failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function moveSessionExerciseController(req: SessionExerciseRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    if(!idParam.safeParse(req.params.sessionId).success) return res.status(404).json({message: "Workout not found."})
    if(!idParam.safeParse(req.params.exerciseId).success) return res.status(404).json({message: "Exercise not found."})
    const parsed = moveExerciseBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const result = await moveSessionExercise(req.userId, req.params.sessionId, req.params.exerciseId, parsed.data.direction)
        if(!result.ok)
        {
            if(result.reason === "NOT_FOUND")
                return res.status(404).json({message: "Workout not found."})
            if(result.reason === "CLOSED")
                return res.status(409).json({message: "This workout is finished or cancelled."})
            if(result.reason === "EXERCISE_NOT_FOUND")
                return res.status(404).json({message: "Exercise not found."})
            if(result.reason === "ALREADY_FIRST")
                return res.status(422).json({message: "This exercise is already first."})
            if(result.reason === "ALREADY_LAST")
                return res.status(422).json({message: "This exercise is already last."})
            return res.status(409).json({message: "The workout changed. Please try again."})
        }
        return res.status(200).json(result.exerciseIds)
    }catch(error){
        console.error("PATCH /api/workout-sessions/:sessionId/exercises/:exerciseId failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}
