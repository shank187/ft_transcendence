import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate";

export function getWorkoutPlansController(req: AuthenticatedRequest, res: Response)
{
    return res.status(200).json({
        message: "Workouts Plans Route Reached",
        userId: req.userId,
    });
}