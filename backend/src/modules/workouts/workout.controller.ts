import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import { createWorkoutDay, createWorkoutPlan, deleteWorkoutDay, deleteWorkoutPlan, getWorkoutDay, getWorkoutPlan, getWorkoutPlans, renameWorkoutDay, updateWorkoutPlan } from "./workout.service";
import { MAX_DAYS_PER_PLAN, MAX_PLANS_PER_USER, workoutDayBody, workoutPlanBody } from "./workout.schema";

// Express types every param as string | string[]; a named :param is always one string.
type PlanRequest = AuthenticatedRequest & { params: { planId: string } };
type DayRequest = AuthenticatedRequest & { params: { planId: string; dayId: string } };

export async function getWorkoutPlansController(req: AuthenticatedRequest, res: Response)
{
    if(!req.userId)
    {
        return res.status(401).json({
            message: "Unauthorized",
        })
    }
    try{
        const workoutPlans = await getWorkoutPlans(req.userId);
        return res.status(200).json(workoutPlans);
    }catch(error){
        console.error("GET /api/workout-plans failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function createWorkoutPlanController(req: AuthenticatedRequest, res: Response) {
    if(!req.userId)
    {
        return res.status(401).json({
            message: "Unauthorized",
        })
    }
    const parsed = workoutPlanBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const result = await createWorkoutPlan(req.userId, parsed.data)
        if(!result.ok)
        {
            return res.status(422).json({message: `You can have at most ${MAX_PLANS_PER_USER} plans.`})
        }
        return res.status(201).json(result.plan)
    }
    catch(error){
        console.error("POST /api/workout-plans failed:", error)
        return res.status(500).json({ message: "Internal server error" });
    }
}

export async function getWorkoutPlanController(req: PlanRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    try{
        const data = await getWorkoutPlan(req.userId, req.params.planId);
        if(!data) return res.status(404).json({message: "Plan not found."})
        return res.status(200).json(data)
    }catch(error){
        console.error("GET /api/workout-plans/:planId failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function updateWorkoutPlanController(req: PlanRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    const parsed =  workoutPlanBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const resp = await updateWorkoutPlan(req.userId, req.params.planId, parsed.data)
        if(!resp)
            return res.status(404).json({message: "Plan not found."})
        return res.status(200).json(resp)
    }catch(error){
        console.error("PATCH /api/workout-plans/:planId failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function deleteWorkoutPlanController(req: PlanRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    try{
        const deleted = await deleteWorkoutPlan(req.userId, req.params.planId)
        if(!deleted)
            return res.status(404).json({message: "Plan not found."})
        return res.status(204).send()
    }catch(error){
        console.error("DELETE /api/workout-plans/:planId failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function getWorkoutDayController(req: DayRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    try{
        const day = await getWorkoutDay(req.userId, req.params.planId, req.params.dayId)
        if(!day)
            return res.status(404).json({message: "Day not found."})
        return res.status(200).json(day)
    }catch(error){
        console.error("GET /api/workout-plans/:planId/days/:dayId failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function createWorkoutDayController(req: PlanRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    const parsed = workoutDayBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const result = await createWorkoutDay(req.userId, req.params.planId, parsed.data.name)
        if(!result.ok)
        {
            if(result.reason === "TOO_MANY_DAYS")
                return res.status(422).json({message: `A plan can have at most ${MAX_DAYS_PER_PLAN} days.`})
            if(result.reason === "NOT_FOUND")
                return res.status(404).json({message: "Plan not found."})
            return res.status(409).json({message: "The plan changed. Please try again."})
        }
        return res.status(201).json(result.day)
    }
    catch(error){
        console.error("POST /api/workout-plans/:planId/days failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function renameWorkoutDayController(req: DayRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    const parsed = workoutDayBody.safeParse(req.body)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const result = await renameWorkoutDay(req.userId, req.params.planId, req.params.dayId, parsed.data.name)
        if(!result.ok)
        {
            return res.status(404).json({message: "Day not found."})
        }
        return res.status(200).json(result.day)
    }
    catch(error)
    {
        console.error("PATCH /api/workout-plans/:planId/days/:dayId failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function deleteWorkoutDayController(req: DayRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    try{
        const result = await deleteWorkoutDay(req.userId, req.params.planId, req.params.dayId)
        if(!result.ok)
        {
            if(result.reason === "NOT_FOUND")
                return res.status(404).json({message: "Day not found."})
            return res.status(409).json({message: "The plan changed. Please try again."})
        }
        return res.status(200).json(result.days)
    }catch(error){
        console.error("DELETE /api/workout-plans/:planId/days/:dayId failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}
