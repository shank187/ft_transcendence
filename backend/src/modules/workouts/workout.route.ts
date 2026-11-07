import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { getWorkoutPlansController, postWorkoutPlansController } from "./workout.controller";

const router = Router();

router.get('/', authenticate, getWorkoutPlansController);

router.post('/', authenticate, postWorkoutPlansController)

export default router;