import { Request ,Response } from "express"
import {setUserCUrrentGym} from "./gym.services"
import type { AuthenticatedRequest } from "../../middleware/authenticate";
import {getUserCUrrentGym} from "./gym.services"
import { error } from "console";


export async function updateCurrentGym(req : AuthenticatedRequest , res : Response){
    if (!req.userId)
            return res.status(401).json({message : "unauthorized"});
    try{
        const userId = req.userId;
        const gymId = req.body.gymId;
        const updatedUser = await setUserCUrrentGym(userId, gymId)
        res.status(200).json(updatedUser);

    }catch(e){
        console.log(e);
        res.status(500).json({error : "Failed to update current gym"})
    }
}


export async function getCurrentGym(req :AuthenticatedRequest, res:Response){
    if (!req.userId)
        return res.status(401).json("unauthorized");
    try{
        const user = await getUserCUrrentGym(req.userId);
        if (user && user?.currentGymId)
            res.status(200).json((user));
        else 
            return res.status(200).json(null);
    }catch(e){
        res.status(200).json({error : "Failed to get current gym"});
    }
}