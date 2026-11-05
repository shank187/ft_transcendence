import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import {
    getProgressSummary,
    getLeaderboard,
} from "./progress.controller";

const router = Router();

router.get("/summary", authenticate, getProgressSummary);
router.get("/leaderboard", authenticate, getLeaderboard);

export default router;