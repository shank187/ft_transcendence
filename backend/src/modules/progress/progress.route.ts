import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { getProgressSummary } from "./progress.controller";

const router = Router();

router.get("/summary", authenticate, getProgressSummary);

export default router;