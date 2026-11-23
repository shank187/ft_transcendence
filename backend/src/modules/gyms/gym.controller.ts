import type { AuthenticatedRequest } from "../../middleware/authenticate";
import { Request, Response } from "express";
import {searchForGyms} from "./gym.service"
import {getGymById} from "./gym.service";
import {getALLEquip} from "./gym.service"
import {createGym} from "./gym.service";
import {getSubmissions} from "./gym.service"
import { prisma } from "../../lib/prisma";
import {selectCurrentGym} from "./gym.service";
import {getCurrentGym} from "./gym.service";
import {resetCurrent} from "./gym.service"
import {getPrivate} from "./gym.service"
import {RMPrivateGym} from "./gym.service";
import {getUserSubmissions} from "./gym.service";
import {EditGym} from "./gym.service";
import {rejectSubmission, approveSubmission} from "./gym.service";
import { GymRejectReason } from "@prisma/client";


export async function searchGymsController(req : AuthenticatedRequest, res : Response){
    if (!req.userId){
        return res.status(401).json({message :  "unauthorized"});
    }
    try{
        const search = typeof req.query.textSearched === "string" ? req.query.textSearched : undefined;
        const city  = typeof req.query.city === "string" ? req.query.city : undefined ;
        const page = Number(req.query.page) || 1 ;

        const sort = typeof req.query.sort === "string" ? req.query.sort : undefined;

        let isVerified : boolean | undefined = undefined;
        if (req.query.verified === "true")
                isVerified = true;
        if (req.query.verified === "false")
                isVerified = false;

        const gyms = await searchForGyms(search, city, isVerified, sort, page);
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
        const gym = await getGymById(id, userId);

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

    if (!name  || typeof name != "string" || name.trim().length < 2 || name.trim().length > 80)
        return res.status(400).json({e: "Gym name must be between 2 and 80 characters."});

    if (!isPrivate && (!city || typeof city !== "string" || !city.trim()))
        return res.status(400).json({ message: "City is required for public gyms." });


    if (isPrivate){
        const privateCount = await prisma.gym.count({
            where : {createdById : req.userId, visibility : "PRIVATE"}
        });
        if (privateCount >= 5){
            return res.status(422).json({ message: "You can have at most 5 private gyms." });
        }
    }
    else{
        const pendingCount = await prisma.gymSubmission.count({
            where : {submitterId : req.userId, status:"PENDING"}
        });
        if (pendingCount >= 5) {
            return res.status(422).json({ message: "You can have at most 5 pending submissions." });
        }
    }
        const  validArrayEquip = Array.isArray(equipment)?  equipment : [];
        const uniqueEquipIds : string[] = [];
        for(const item of validArrayEquip){
            const id = item.equipmentId;
            if (typeof id === "string" && id.trim() !== "" && !uniqueEquipIds.includes(id)){
                uniqueEquipIds.push(id);
            }
        }


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


        dataEquip : uniqueEquipIds.map(function(id){
            return {
                equipmentId : id,
                quantity : 1,
            };
        }),
    }
    
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
        const isAdmin = await prisma.userRole.findFirst({
            where : {
                userId : req.userId,
                role : {
                    name : "ADMIN"
                }}
        });
        if (!isAdmin){
            return res.status(403).json({message: "Forbidden: admin access required."});
        }
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

    // 2. Safety check: Did Multer actually find an image file?
    if (!req.file) {
        return res.status(400).json({ message: "Please select an image." });
    }

    // 3. Multer saved the file to /public/uploads/gyms/ filename.jpg
    // We create the URL that the browser can visit:
    const imageUrl = "/uploads/gyms/" + req.file.filename;

    // 4. Send that URL back to the frontend!
    res.status(200).json({ imageUrl });
}

export async function rejectSubmissionController(
    req: AuthenticatedRequest,
    res: Response,
) {
    const reviewerId = req.userId;
    const submissionId = req.params.id;
    const reason = Object.values(GymRejectReason).find((value) => value === req.body?.reason,);
    const detail = typeof req.body?.detail === "string" ? req.body.detail.trim() || null: null;
    if (!reviewerId) {
        return res.status(401).json({ message: "Sign in first." });
    }

    if (typeof submissionId !== "string" || !submissionId.trim() || !reason) {
        return res.status(400).json({ message: "A submission ID and reason are required." });
    }

    try {
        const adminRole = await prisma.userRole.findFirst({
            where: { userId: reviewerId, role: { name: "ADMIN" } },
        });

        if (!adminRole) {
            return res.status(403).json({ message: "Admin access required." });
        }

        const result = await rejectSubmission(submissionId, reviewerId, reason, detail);

        switch (result) {
            case "REJECTED":
                return res.status(200).json({ id: submissionId, status: "REJECTED" });
            case "not-found":
                return res.status(404).json({ message: "Submission not found." });
            case "self-review":
                return res.status(403).json({ message: "You can’t review your own submission." });
            case "conflict":
                return res.status(409).json({ message: "This submission was already reviewed." });
        }
    } catch (error) {
        console.error("Could not reject gym submission", error);
        return res.status(500).json({ message: "Could not decline the submission." });
    }
}

export async function approveSubmissionController(
    req: AuthenticatedRequest,
    res: Response,
) {
    const reviewerId = req.userId;
    const submissionId = req.params.id;

    if (!reviewerId) {
        return res.status(401).json({ message: "Sign in first." });
    }

    if (typeof submissionId !== "string" || !submissionId.trim()) {
        return res.status(400).json({ message: "A submission ID is required." });
    }

    try {
        // Check admin access before changing the submission.
        const adminRole = await prisma.userRole.findFirst({
            where: { userId: reviewerId, role: { name: "ADMIN" } },
        });

        if (!adminRole) {
            return res.status(403).json({ message: "Admin access required." });
        }

        const result = await approveSubmission(submissionId, reviewerId);

        switch (result) {
            case "approved":
                return res.status(200).json({ id: submissionId, status: "APPROVED" });
            case "not-found":
                return res.status(404).json({ message: "Submission not found." });
            case "self-review":
                return res.status(403).json({ message: "You can’t review your own submission." });
            case "conflict":
                return res.status(409).json({ message: "This submission was already reviewed." });
            case "unsupported":
                return res.status(409).json({ message: "This submission type cannot be approved yet." });
        }
    } catch (error) {
        console.error("Could not approve gym submission", error);
        return res.status(500).json({ message: "Could not approve the submission." });
    }
}

export async function CurrentGymCOntroller(req : AuthenticatedRequest, res:Response){
    if (!req.userId)
            return res.status(401).json({message: "unauthorized"});
    const gymId = req.body.gymId;


    if (gymId === null){
        await resetCurrent(req.userId);
        return res.status(200).json({message: "Gym reset successfully"});
    }
    if (typeof gymId !== "string")
        return res.status(400).json({ message: "gymId is required" });

    try{
        await selectCurrentGym(gymId, req.userId);
        res.status(200).json({ message: "Gym selected successfully" });

    }catch(e : any){
        if (e.message === "Gym not found")
            return res.status(404).json({error: "Gym not found"});
        if (e.message === "Access denied")
            return res.status(403).json({error: "Access denied"});
        if (e.message === "Gym is unverified")
            return res.status(422).json({error : "Cannot select an unverified gym"});
        if (e.message === "Gym is closed")
            return res.status(422).json({error: "Cannot select a closed gym"});
        console.log(e);
        res.status(500).json({ error: "server error" });
    }
}


export async function getCurrentGymCOntroller(req : AuthenticatedRequest, res:Response){
    if (!req.userId)
        return res.status(401).json({message: "unauthorized"});

    const userId = req.userId;
    try{
        const currentGym = await getCurrentGym(userId);
        res.status(200).json(currentGym)
    }catch(e){
        console.log(e);
        res.status(500).json({e: "server error"});
    }
}
export async function getPrivateController(req : AuthenticatedRequest, res:Response){
    if (!req.userId)
        return res.status(401).json({message: "unauthorized"});

    const userId = req.userId;
    try{
        const privateList  = await getPrivate(userId);
        res.status(200).json(privateList);
    }catch(e){
        console.log(e);
        res.status(500).json({e: "server error"});   
    }
}


export async function RMPrivateGymController(req : AuthenticatedRequest, res : Response){
    if (!req.userId)
        return res.status(401).json({message: "unauthorized"});
    
    const userId = req.userId;
    const gymId = req.params.id;

    if (typeof gymId !== "string")
        return res.status(400).jsonp({error: "Invalid gym ID"});
    try{
        await RMPrivateGym(gymId, userId);
        res.status(200).json({message : "Gym deleted successfully"});
    }catch(e : any){
        if (e.message === "gym not found")
            return res.status(404).json({error : "gym not found"});
        if (e.message === "access denied")
            return res.status(403).json({error : "access denied"});


        console.log(e);
        res.status(500).json({error : "server error"});
    }
}


export async function getUserSubmissionsController(req : AuthenticatedRequest, res : Response){
    if (!req.userId)
        return res.status(401).json({message: "unauthorized"});

    const userId = req.userId;

    try{
        const gymList = await getUserSubmissions(userId);
        res.status(200).json(gymList);
    }catch(e){
        console.log(e);
        res.status(500).json({error : "server error"});
    }
}


export async function EditGymCOntroller(req : AuthenticatedRequest, res : Response){
    if (!req.userId)
        return res.status(401).json({message: "unauthorized"});

    const useId = req.userId;
    const gymId = req.params.id;

    if (typeof gymId !== "string"){
        return res.status(400).json({error : "invalid gym ID"});
    }
    const data = req.body;

    if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2 || data.name.trim().length > 80){
        return res.status(400).json({ error: "Gym name must be between 2 and 80 characters." });
    }

    if (data.address && (typeof data.address !== "string" || data.address.trim().length > 200)) {
        return res.status(400).json({ error: "Address can't exceed 200 characters." });
    }
    if (data.phone && (typeof data.phone !== "string" || data.phone.trim().length > 15)) {
        return res.status(400).json({ error: "Phone can't exceed 15 characters." });
    }
    const  validArrayEquip = Array.isArray(data.equipment)?  data.equipment : [];
    const uniqueEquipIds : string[] = [];
        for(const item of validArrayEquip){
            const id = item.equipmentId;
            if (typeof id === "string" && id.trim() !== "" && !uniqueEquipIds.includes(id)){
                uniqueEquipIds.push(id);
            }
        }
    data.equipment = uniqueEquipIds.map(id => ({ equipmentId: id, quantity: 1 }));
    try{
        await EditGym(useId, gymId, data);
        res.status(200).json({message : "Gym updated successfully"});
    }
    catch(e : any){
        if (e.message === "gym not found")
            return res.status(404).json({error : "gym not found"});
        if (e.message === "Acees denied")
            return res.status(403).json({error : "Access denied"});

        console.log(e);
        res.status(500).json({error :"server error"});
    }
}
