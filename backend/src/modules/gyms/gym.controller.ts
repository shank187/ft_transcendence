import type { AuthenticatedRequest } from "../../middleware/authenticate";
import { Request, Response } from "express";
import {searchForGyms} from "./gym.service"
import {getGymById} from "./gym.service";

export async function searchGymsController(req : AuthenticatedRequest, res : Response){
    if (!req.userId){
        return res.status(401).json({message :  "unauthorized"});
    }
    try{
        const search = typeof req.query.textSearched === "string" ? req.query.textSearched : undefined;
        const city  = typeof req.query.city === "string" ? req.query.city : undefined ;
        const page = Number(req.query.page) || 1 ;

        let isVerified : boolean | undefined = undefined;
        if (req.query.verified === "true")
                isVerified = true;
        if (req.query.verified === "false")
                isVerified = false;

        const gyms = await searchForGyms(search, city, isVerified, page);
        res.status(200).json(gyms);
    }
    catch(e){
        console.log("error fetching gyms",e);
        res.status(500).json({error : "server error"})
    }

}

export async function getGymByIdController(req :AuthenticatedRequest, res:Response){
    if (!req.userId)
        return res.status(401).json({message :  "unauthorized"});

    try{
        const id = req.params.id;
        if (typeof id != "string")
            return res.status(400).json({ error: "Invalid or missing gym ID" });
        const gym = await getGymById(id);
        if (!gym)
            return res.status(404).json({message: "Gym not found"});
        res.status(200).json(gym);
    }
    catch(e){
        console.log("error fetching this gym", e);
        res.status(500).json({error : "server error"});
    }
}