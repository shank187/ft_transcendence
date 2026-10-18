import { parseListQuery } from "./exercise.query";
import { getExercises, getExercisesFilters } from "./exercise.service";
import type { Request, Response } from "express";



export async function getExercisesController(req: Request, res: Response) {

    
    const check = parseListQuery(req.query)
    if (check.ok === false){
        return res.status(400).json({
            message: check.message
        });
    }
    const exercises = await getExercises(check.value);
    res.status(200).json(exercises)
}

export async function getExercisesFiltersController(_req: Request, res: Response)
{
    const filters = await getExercisesFilters()
    res.status(200).json(filters)
}