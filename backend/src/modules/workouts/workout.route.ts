import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { getWorkoutDetailsController, getWorkoutPlansController, postWorkoutDayController, postWorkoutPlansController } from "./workout.controller";

const router = Router();

router.get('/', authenticate, getWorkoutPlansController);
router.post('/', authenticate, postWorkoutPlansController);

router.get('/:planId', authenticate, getWorkoutDetailsController);
router.post('/:planId/days', authenticate, postWorkoutDayController);

export default router;
