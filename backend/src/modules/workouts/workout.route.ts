import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { getWorkoutPlansController } from "./workout.controller";

const router = Router();

router.get('/', authenticate, getWorkoutPlansController);

export default router;