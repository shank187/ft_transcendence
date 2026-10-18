import { Router } from "express";
import { getExercisesController, getExercisesFiltersController } from "./exercise.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.get("/", authenticate, getExercisesController);
router.get("/filters", authenticate, getExercisesFiltersController);

export default router;
