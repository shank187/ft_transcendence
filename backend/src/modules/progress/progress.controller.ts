import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import { countCompletedWorkouts } from "./progress.service";

export async function getProgressSummary(
    req: AuthenticatedRequest,
    res: Response
) {
    if (!req.userId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try {
        const completedWorkouts = await countCompletedWorkouts(
            req.userId
        );

        return res.status(200).json({
            completedWorkouts,
        });
    } catch (error) {
        console.error("Failed to load progress:", error);

        return res.status(500).json({
            message: "Could not load progress",
        });
    }
}