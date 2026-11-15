import type { Response } from "express";
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import { getEquipment } from "./equipment.service";

export async function getEquipmentController(req: AuthenticatedRequest, res: Response) {
    if(!req.userId) return res.status(401).json({message: "Unauthorized"})
    try{
        const equipment = await getEquipment()
        return res.status(200).json(equipment)
    }catch(error){
        console.error("GET /api/equipment failed:", error)
        return res.status(500).json({message: "Internal server error"})
    }
}
