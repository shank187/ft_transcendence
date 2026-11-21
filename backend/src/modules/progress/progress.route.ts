import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
    getProgressSummary,
    getLeaderboard,
    getWeeklyStatus,
} from "./progress.controller";

const router = Router();

router.get("/summary", authenticate, getProgressSummary);
router.get("/leaderboard", authenticate, getLeaderboard);
router.get("/week", authenticate, getWeeklyStatus);

export default router;