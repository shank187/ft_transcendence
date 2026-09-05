import { Router } from "express";
import { getExercisesController } from "./exercise.controller";

const router = Router();

router.get("/", getExercisesController);

export default router;