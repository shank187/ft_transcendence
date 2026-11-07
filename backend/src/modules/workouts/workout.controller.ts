import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import { getWorkoutPlans, postWorkoutPlan } from "./workout.service";
import { createWorkoutPlanBody } from "./workout.schema";

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