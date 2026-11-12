import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { addSessionExercisesController, addSessionSetController, deleteSessionSetController, discardWorkoutSessionController, finishWorkoutSessionController, getWorkoutSessionController, moveSessionExerciseController, startWorkoutSessionController, updateSessionSetController } from "./workout-session.controller";

const router = Router();

router.post('/', authenticate, startWorkoutSessionController)
router.get('/:sessionId', authenticate, getWorkoutSessionController)
router.patch('/:sessionId', authenticate, discardWorkoutSessionController)
router.post('/:sessionId/finish', authenticate, finishWorkoutSessionController)
router.post('/:sessionId/exercises', authenticate, addSessionExercisesController)
router.patch('/:sessionId/exercises/:exerciseId', authenticate, moveSessionExerciseController)
router.post('/:sessionId/exercises/:exerciseId/sets', authenticate, addSessionSetController)
router.patch('/:sessionId/sets/:setId', authenticate, updateSessionSetController)
router.delete('/:sessionId/sets/:setId', authenticate, deleteSessionSetController)
export default router;
