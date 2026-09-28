import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import { getWorkoutPlans } from "./workout.service";

export async function getWorkoutPlansController(req: AuthenticatedRequest, res: Response)
{
    if(!req.userId)
    {
        return res.status(401).json({
            message: "Unauthorized",
        })    
    }
    const workoutsPlans = await getWorkoutPlans(req.userId);

    return res.status(200).json(workoutsPlans);
}