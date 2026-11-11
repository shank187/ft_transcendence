import type { AuthenticatedRequest } from "../../middleware/authenticate";
import { Request, Response } from "express";
import {searchForGyms} from "./gym.service"
import {getGymById} from "./gym.service";
import {getALLEquip} from "./gym.service"
import {createGym} from "./gym.service";
import {getSubmissions} from "./gym.service"


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
        const userId = req.userId;


        if (typeof id != "string")
            return res.status(400).json({ error: "Invalid or missing gym ID" });
        const gym = await getGymById(id);

        if (!gym)
            return res.status(404).json({message: "Gym not found"});

        if (gym.visibility === "PRIVATE" && gym.createdById !== userId){
            return res.status(403).json({ message: "Access denied" });
        }

        res.status(200).json(gym);
    }
    catch(e){
        console.log("error fetching this gym", e);
        res.status(500).json({error : "server error"});
    }
}


export async function getALLEquipController(req : AuthenticatedRequest, res:Response){
    if (!req.userId)
        return res.status(401).json({message :  "unauthorized"});

    try{
        const equip = await getALLEquip();
        res.status(200).json(equip);
    }
    catch(e){
        console.log(e);
        res.status(500).json({e: "server error"});
    }
}


export async function createGymController(req : AuthenticatedRequest, res:Response){
    if (!req.userId)
        return res.status(401).json({message :  "unauthorized"});

    const {name , city , address, phone ,website, description, imageUrl, isPrivate, equipment} = req.body;

    if (!name  || typeof name != "string" || name.trim() === "")
        return res.status(400).json({e: "gym name is required"});

    const data = {
        userID : req.userId,
        dataName : name.trim(),
        dataCity : typeof city === "string" && city.trim() !== "" ? city.trim() : undefined,
        dataAddress : typeof address === "string" && address.trim() !== "" ? address.trim() :  undefined,
        dataPhone : typeof phone === "string" && phone.trim() !== "" ? phone.trim() : undefined,
        dataWebsite: typeof website === "string" && website.trim() !== "" ? website.trim()  : undefined,
        dataDescription : typeof description === "string" &&  description.trim() !== "" ? description.trim() : undefined,
        dataImageUrl : typeof imageUrl === "string" ? imageUrl.trim() : undefined,
        dataIsPrivate : isPrivate === true,


        dataEquip : Array.isArray(equipment) ? equipment.filter(function(item){
            return typeof item.equipmentId === "string" && item.equipmentid.trim() !== ""
        }) : [],
    };
    
    try {
        const result = await createGym(data);

        const msg  = isPrivate 
        ? "Private gym created successfully" 
        :"Gym submitted for admin approval";
        res.status(201).json({msg, result});
    }catch(e){
        console.log(e);
        res.status(500).json({e: "server error"});
    }
}

export async function getSubmissionsController(req : AuthenticatedRequest, res:Response){
    if (!req.userId)
        return res.status(401).json({message :  "unauthorized"});

    try{
        const submissions = await getSubmissions();
        res.status(200).json(submissions);
    }
    catch(e){
        console.log(e);
        res.status(500).json({e: "server error"});
    }
}







export async function uploadGymImageController(req: AuthenticatedRequest, res: Response) {
    // 1. Safety check: Is user logged in?
    if (!req.userId) {
        return res.status(401).json({ message: "unauthorized" });
    }

    // 2. Safety check: Did Multer actually receive a file?
    // If the user sent empty data, req.file will be undefined!
    if (!req.file) {
        return res.status(400).json({ message: "Please select an image." });
    }

    // 3. Multer already saved the file to disk!
    // req.file.filename is the generated name, like "9a2f-48bc.jpg".
    // We build the URL path that the browser can visit:
    const imageUrl = "/uploads/gyms/" + req.file.filename;

    // 4. Send that URL back to the frontend!
    res.status(200).json({ imageUrl });
}