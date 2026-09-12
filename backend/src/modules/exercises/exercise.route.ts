import { Router } from "express";
import { getExercisesController } from "./exercise.controller";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.get("/", authenticate, getExercisesController);

export default router;