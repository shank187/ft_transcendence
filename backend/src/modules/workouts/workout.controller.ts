import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import { getWorkoutDetail, getWorkoutPlans, postWorkoutDay, postWorkoutPlan, renameWorkoutDay, RenameWorkoutPlan } from "./workout.service";
import { createWorkoutDayBody, createWorkoutPlanBody } from "./workout.schema";

export async function getWorkoutPlansController(req: AuthenticatedRequest, res: Response)
{
    if(!req.userId)
    {
        return res.status(401).json({
            message: "Unauthorized",
        })    
    }
    const workoutPlans = await getWorkoutPlans(req.userId);

    return res.status(200).json(workoutPlans);
}

export async function postWorkoutPlansController(req: AuthenticatedRequest, res: Response) {
    if(!req.userId)
    {
        return res.status(401).json({
            message: "Unauthorized",
        })    
    }
    const parsed = createWorkoutPlanBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const data = await postWorkoutPlan(req.userId, parsed.data)
        return res.status(201).json(data)
    }
    catch(err){
        console.error("POST /api/workout-plans failed:", err); 
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getWorkoutDetailsController(req: AuthenticatedRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    if(typeof req.params.planId !== "string" ) return res.status(400).json({message: "Missing plan's Id in the parametres"})
    try{
        const data = await getWorkoutDetail(req.userId, req.params.planId);
        if(!data) return res.status(404).json({message: "Plan Not Found"})
        return res.status(200).json(data)
    }catch(err){
        console.error(err)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function postWorkoutDayController(req: AuthenticatedRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    if(typeof req.params.planId !== "string" ) return res.status(400).json({message: "Missing plan's Id in the parametres"})
    const parsed = createWorkoutDayBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const data = await postWorkoutDay(req.userId, req.params.planId, parsed.data.name)
        if(!data.ok && data.reason === "TOO_MANY_DAYS")
            return res.status(422).json({message: "A plan can have at most 7 days."})
        else if(!data.ok && data.reason === "NOT_FOUND")
            return res.status(404).json({message: "Plan not found."})
        else if (!data.ok && data.reason === "CONFLICT")
            return res.status(409).json({ message: "The plan changed. Please try again." });
        else if(data.ok)
            return res.status(201).json(data.day)
    }
    catch(err){
        console.error(err)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function patchDayNameController(req: AuthenticatedRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    if(typeof req.params.planId !== "string" || typeof req.params.dayId !== "string") return res.status(400).json({message: "the Parameters are not valid"})

    const parsed = createWorkoutDayBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const result = await renameWorkoutDay(req.userId, req.params.planId, req.params.dayId, parsed.data.name)
        if(!result.ok)
            return res.status(404).json("Day not found.")
        else if(result.ok)
            return res.status(200).json(result.day)
        }
    catch(error)
    {
        console.error(error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function patchWorkoutPlanController(req: AuthenticatedRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    if(typeof req.params.PlanId !== "string") return res.status(400).json({message: "Invalid Parameters"})
    const parsed =  createWorkoutPlanBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const resp = await RenameWorkoutPlan(req.userId, req.params.PlanId, parsed.data)
        if(!resp)
            return res.status(404).json({message: "Plan not found."})
        return res.status(200).json(resp)
    }catch(error){
        console.error(error)
        return res.status(500).json({message: "Internal server error"})
    }
}