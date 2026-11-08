import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import { discardWorkoutSession, getWorkoutSession } from "./workout-session.service";
import { discardSessionBody } from "./workout-session.schema";

// Express types every param as string | string[]; a named :param is always one string.
type SessionRequest = AuthenticatedRequest & { params: { sessionId: string } };

export async function getWorkoutSessionController(req: SessionRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
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
    const parsed = discardSessionBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
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
        console.error("PATCH /api/workout-sessions/:sessionId failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}
