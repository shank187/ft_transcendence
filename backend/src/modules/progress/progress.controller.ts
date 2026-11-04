import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import {
    countCompletedWorkouts,
    getTotalXp,
    getLeaderboardEntries,
} from "./progress.service";


export async function getLeaderboard(
    req: AuthenticatedRequest,
    res: Response
) {
    if (!req.userId) {
        return res.status(401).json({
            message: "Unauthorized",
        });
    }

    try {
        const entries = await getLeaderboardEntries();

        return res.status(200).json(entries);
    } catch (error) {
        console.error("Failed to load leaderboard:", error);

        return res.status(500).json({
            message: "Could not load leaderboard",
        });
    }
}

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

        const totalXp = await getTotalXp(req.userId);

        return res.status(200).json({
            completedWorkouts,
            totalXp,
        });
    } catch (error) {
        console.error("Failed to load progress:", error);

        return res.status(500).json({
            message: "Could not load progress",
        });
    }
}