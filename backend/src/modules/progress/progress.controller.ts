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

    // demo until i fetch the actual progress data from the database
    return res.status(200).json({
        completedWorkouts: 101,
        totalVolume: 0,
        period: "30d",
    });
}