import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { createWorkoutDayController, createWorkoutPlanController, deleteWorkoutDayController, deleteWorkoutPlanController, getWorkoutDayController, getWorkoutPlanController, getWorkoutPlansController, putWorkoutDayController, renameWorkoutDayController, updateWorkoutPlanController } from "./workout.controller";

const router = Router();

router.get('/', authenticate, getWorkoutPlansController);
router.post('/', authenticate, createWorkoutPlanController);

router.get('/:planId', authenticate, getWorkoutPlanController);
router.post('/:planId/days', authenticate, createWorkoutDayController);
router.get('/:planId/days/:dayId', authenticate, getWorkoutDayController)
router.put('/:planId/days/:dayId/exercises', authenticate, putWorkoutDayController)
router.patch('/:planId/days/:dayId', authenticate, renameWorkoutDayController)
router.delete('/:planId/days/:dayId', authenticate, deleteWorkoutDayController)
router.patch('/:planId', authenticate, updateWorkoutPlanController)
router.delete('/:planId', authenticate, deleteWorkoutPlanController)
export default router;
