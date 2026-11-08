import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { discardWorkoutSessionController, getWorkoutSessionController } from "./workout-session.controller";

const router = Router();

router.get('/:sessionId', authenticate, getWorkoutSessionController)
router.patch('/:sessionId', authenticate, discardWorkoutSessionController)
export default router;
