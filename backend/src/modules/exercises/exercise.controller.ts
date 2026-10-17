import { getExercises } from "./exercise.service";
import type { Request, Response } from "express";

export async function getExercisesController(req: Request, res: Response) {
    const rawPage = typeof req.query.page === 'string' ? req.query.page : '1';
    const rawLimit = typeof req.query.limit === 'string' ? req.query.limit : '12';
    const rawSearch = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const page = Number(rawPage)
    const limit = Number(rawLimit)
    const search = rawSearch.length > 0 ? rawSearch : undefined
    
    if (
        !Number.isInteger(page) ||
        !Number.isInteger(limit) ||
        page < 1 ||
        limit < 1||
        limit > 50
    ){
        return res.status(400).json({
            message: 'Invalid Pagination parameteres'
        });
    }

    const exercises = await getExercises(page, limit, search);
    res.status(200).json(exercises)
}