import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { getWorkoutDetailsController, getWorkoutPlansController, postWorkoutPlansController } from "./workout.controller";

const router = Router();

router.get('/', authenticate, getWorkoutPlansController);

router.get('/:planId', authenticate, getWorkoutDetailsController);

router.post('/', authenticate, postWorkoutPlansController)

export default router;