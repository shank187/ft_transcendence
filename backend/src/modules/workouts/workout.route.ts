import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { deleteWorkoutDayController, getWorkoutDetailsController, getWorkoutPlansController, patchDayNameController, patchWorkoutPlanController, postWorkoutDayController, postWorkoutPlansController } from "./workout.controller";

const router = Router();

router.get('/', authenticate, getWorkoutPlansController);
router.post('/', authenticate, postWorkoutPlansController);

router.get('/:planId', authenticate, getWorkoutDetailsController);
router.post('/:planId/days', authenticate, postWorkoutDayController);
router.patch('/:planId/days/:dayId', authenticate, patchDayNameController)
router.delete('/:planId/days/:dayId', authenticate, deleteWorkoutDayController)
router.patch('/:planId', authenticate, patchWorkoutPlanController)
export default router;
