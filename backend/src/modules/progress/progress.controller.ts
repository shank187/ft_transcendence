import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate";

export async function getProgressSummary(
    req: AuthenticatedRequest,
    res: Response
) {
    if (!req.userId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    return res.status(200).json({
        completedWorkouts: 0,
        totalVolume: 0,
        period: "30d",
    });
}