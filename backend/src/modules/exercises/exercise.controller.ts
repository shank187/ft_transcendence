import { parseListQuery } from "./exercise.query";
import { getExercises, getExercisesFilters } from "./exercise.service";
import type { Request, Response } from "express";

export async function getExercisesController(req: Request, res: Response) {
    try {
        const check = parseListQuery(req.query)
        if (check.ok === false) {
            return res.status(400).json({
                message: check.message
            });
        }
        const result = await getExercises(check.value);
        if (result.ok === false)
            return res.status(400).json({ message: result.message })
        else
            return res.status(200).json(result.value)
    }
    catch (error) {
        console.error("GET /api/exercises failed:", error);
        return res.status(500).json({ message: "Internal server error" })
    }
}

export async function getExercisesFiltersController(_req: Request, res: Response) {
    try {
        const filters = await getExercisesFilters()
        res.status(200).json(filters)
    }
    catch (error) {
        console.error("GET /api/exercises/filters failed:", error);
        return res.status(500).json({ message: "Internal server error" })
    }
}
