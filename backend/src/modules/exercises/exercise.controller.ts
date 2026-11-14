import type { Response } from "express";
import { getExercises, getExercisesFilters } from "./exercise.service";
import { exerciseListQuery } from "./exercise.schema";
import type { AuthenticatedRequest } from "../../middleware/authenticate";

export async function getExercisesController(req: AuthenticatedRequest, res: Response) {
    if (!req.userId)
        return res.status(401).json({message: "Unauthorized"})
    const parsed = exerciseListQuery.safeParse(req.query)
    if(!parsed.success)
        return res.status(400).json({message: parsed.error.issues[0].message})
    try{
        const result = await getExercises(parsed.data, req.userId)
        if(!result.ok)
        {
            if(result.reason === "MUSCLE_NOT_FOUND")
                return res.status(400).json({message: "Invalid Muscle"})
            else if(result.reason === "NO_CURRENT_GYM")
                return res.status(400).json({message: "No current gym"})
            return res.status(400).json({message: "Invalid Equipment"})
        }
        return res.status(200).json(result.list)
    }catch(error){
        console.error("GET /api/exercises failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export async function getExercisesFiltersController(req: AuthenticatedRequest, res: Response) {
    if (!req.userId)
        return res.status(401).json({message: "Unauthorized"})
    try{
        const filters = await getExercisesFilters(req.userId)
        return res.status(200).json(filters)
    }catch(error){
        console.error("GET /api/exercises/filters failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}
