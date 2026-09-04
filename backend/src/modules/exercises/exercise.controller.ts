import { getExercises } from "./exercise.service";
import type { Request, Response } from "express";

export async function getExercisesController(_req: Request, res: Response) {
    const exercises = await getExercises();
    res.status(200).json(exercises)
}