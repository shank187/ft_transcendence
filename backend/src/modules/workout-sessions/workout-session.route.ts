import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { addSessionExercisesController, addSessionSetController, deleteSessionSetController, discardWorkoutSessionController, getWorkoutSessionController, updateSessionSetController } from "./workout-session.controller";

const router = Router();

router.get('/:sessionId', authenticate, getWorkoutSessionController)
router.patch('/:sessionId', authenticate, discardWorkoutSessionController)
router.post('/:sessionId/exercises', authenticate, addSessionExercisesController)
router.post('/:sessionId/exercises/:exerciseId/sets', authenticate, addSessionSetController)
router.patch('/:sessionId/sets/:setId', authenticate, updateSessionSetController)
router.delete('/:sessionId/sets/:setId', authenticate, deleteSessionSetController)
export default router;
