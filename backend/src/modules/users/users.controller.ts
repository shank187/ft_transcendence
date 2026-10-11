import {Response} from 'express';
import { prisma } from '../../lib/prisma';
import { AuthenticatedRequest } from '../../middleware/authenticate';
import bcrypt from "bcrypt";
import { body, validationResult } from "express-validator";
import { unlink } from "node:fs/promises";


const EXPERIENCE_LEVELS = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];
const TRAINING_GOALS = ['BUILD_MUSCLE', 'GAIN_STRENGTH', 'LOSE_FAT', 'IMPROVE_GENERAL_FITNESS', 'IMPROVE_ENDURANCE', 'MAINTAIN_FITNESS'];
const UNIT_SYSTEMS = ['METRIC', 'IMPERIAL'];

export const updateOnboarding = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId;
    const { displayName, bio, experienceLevel, primaryGoal, unitSystem, heightCm, weightKg } = req.body;

    try {
        if (!userId)
            return res.status(401).json({ message: "Unauthorized" });

        if (!displayName || displayName.trim().length === 0)
            return res.status(400).json({ message: "Display name is required" });

        if (!EXPERIENCE_LEVELS.includes(experienceLevel))
            return res.status(400).json({ message: "Invalid experience level" });

        if (!TRAINING_GOALS.includes(primaryGoal))
            return res.status(400).json({ message: "Invalid primary goal" });

        if (!UNIT_SYSTEMS.includes(unitSystem))
            return res.status(400).json({ message: "Invalid unit system" });

        if (heightCm && (heightCm < 20 || heightCm > 300))
            return res.status(400).json({ message: "Height must be between 20 and 300 cm" });

        if (weightKg && (weightKg < 20 || weightKg > 500))
            return res.status(400).json({ message: "Weight must be between 20 and 500 kg" });

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                displayName: displayName.trim(),
                bio: bio ? bio.trim() : undefined,
                experienceLevel,
                primaryGoal,
                unitSystem,
                heightCm: heightCm ? Number(heightCm) : undefined,
                weightKg: weightKg ? Number(weightKg) : undefined,
                onboardingCompletedAt: new Date(),
            },
        });

        res.status(200).json({
            message: "Onboarding completed",
            user: {
                id: updatedUser.id,
                username: updatedUser.username,
                email: updatedUser.email,
                displayName: updatedUser.displayName,
                bio: updatedUser.bio,
                experienceLevel: updatedUser.experienceLevel,
                primaryGoal: updatedUser.primaryGoal,
                unitSystem: updatedUser.unitSystem,
                heightCm: updatedUser.heightCm,
                weightKg: updatedUser.weightKg,
            }
        });
    } catch (error) {
        res.status(500).json({ message: "Internal server error" });
    }
};


export const get_me = async (req: AuthenticatedRequest,res: Response) => {
    const user = await prisma.user.findUnique({
        where: { id: req.userId },
        select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
            bio: true,
            avatarUrl: true,
            experienceLevel: true,
            primaryGoal :true,
            unitSystem :true,
            weightKg: true,
            heightCm: true,
            onboardingCompletedAt: true,
            passwordHash: true
        }
    });

    if (!user)
        return res.status(404).json({ message: "User not found." });
    
    const { passwordHash, ...other_fields } = user;
    return res.json({
        ...other_fields,
        hasPassword: Boolean(passwordHash)
    });
};
 

export const update_me = async (req: AuthenticatedRequest, res: Response) =>{

    try{
        const user = req.body.user;
        const updated_user = await prisma.user.update({
            where :{ id: req.userId},
            data :{
                displayName: user.displayName.trim(),
                bio: user.bio?.trim() || null,
                experienceLevel: user.experienceLevel,
                primaryGoal: user.primaryGoal,
                unitSystem: user.unitSystem,
                weightKg: user.weightKg,
                heightCm: user.heightCm
            },
            select: {
                id: true,
                username: true,
                email: true,
                displayName: true,
                bio: true,
                avatarUrl: true,
                experienceLevel: true,
                primaryGoal: true,
                unitSystem: true,
                weightKg: true,
                heightCm: true,
                onboardingCompletedAt: true,
                passwordHash: true
            },
        });
        const { passwordHash, ...profile } = updated_user;

        return res.status(200).json({
            ...profile,
            hasPassword: Boolean(passwordHash)
        });
    }catch
    {
        return res.status(500).json({ message: "Could not update your profile."});
    }
}


export const change_password = async (req: AuthenticatedRequest, res: Response) =>{

    try {
        const { currentPassword, newPassword } = req.body;



        if (typeof currentPassword !== "string" || typeof newPassword !== "string" || currentPassword === "" || newPassword === "")
            return res.status(400).json({ message: "Please provide both passwords." });

        await body('newPassword')
        .isStrongPassword({
            minLength: 8,
            minLowercase: 1,
            minUppercase: 1,
            minNumbers: 1,
            minSymbols: 1,
        })
        .run(req);

    const errors = validationResult(req); //Get all validation errors stored on this request.

    if (!errors.isEmpty())
        return res.status(400).json({message: errors.array()[0].msg});


        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: { passwordHash: true },
        });

        if (!user)
            return res.status(404).json({ message: "User not found." });

        if (!user.passwordHash)
            return res.status(400).json({
                message: "This account has no password to change.",
            });

        const matches = await bcrypt.compare(currentPassword, user.passwordHash);

        if (!matches)
            return res.status(400).json({ message: "Current password is incorrect." });

        if (currentPassword === newPassword)
            return res.status(400).json({message: "New password must differ from your current password."});

        const passwordHash = await bcrypt.hash(newPassword, 12);

        await prisma.user.update({
            where: { id: req.userId },
            data: { passwordHash }
        });

        return res.status(200).json({ message: "Password updated successfully." });
    } catch {
        return res.status(500).json({ message: "Could not update your password." });
    }

}



export const update_avatar = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.file)
        return res.status(400).json({ message: "Please select an image." });

    try {
        const old_avatar = await prisma.user.findUnique ({
            where: {id :req.userId},
            select:{avatarUrl:true}
        });
        const avatarUrl = "/uploads/avatars/" + req.file.filename;

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: { avatarUrl },
            select: { avatarUrl: true },
        });

        if (old_avatar && old_avatar.avatarUrl)
        {
            const old_url = old_avatar.avatarUrl;
            if (old_url.startsWith("/uploads/avatars/") && old_url !== avatarUrl)
            {
                const filename = old_url.split('/').pop();
                if (filename) {
                    try {
                        await unlink("uploads/avatars/" + filename);
                    } catch (error) {
                        if (typeof error !== "object" || error === null || !("code" in error) || error.code !== "ENOENT")
                            throw error;
                    }
                }
            }
        }

        return res.status(200).json({message: "Avatar updated successfully.", avatarUrl: user.avatarUrl});
    } catch {
        return res.status(500).json({message: "Could not update your avatar."});
    }
};



export const delete_avatar  = async(req :AuthenticatedRequest, res:Response)=>
{
    const avatar = await prisma.user.findUnique ({
        where :{id :req.userId},
        select :{avatarUrl :true}
    });

    if (!avatar)
    return res.status(404).json({ message: "User not found." });

    if (!avatar.avatarUrl){
        return res.status(200).json({message: "You already have no avatar.", avatarUrl: null});}
    
    if (avatar.avatarUrl.startsWith("/uploads/avatars/"))
    {
        const filename = avatar.avatarUrl.split('/').pop();

        if (filename) {
            try {
                await unlink("uploads/avatars/" + filename);
            } catch (error){
                if (typeof error !== "object" || error === null || !("code" in error) || error.code !== "ENOENT")
                    return res.status(500).json({message: "Could not remove your avatar."});
            }
        }
    }

    await prisma.user.update({
        where: { id: req.userId },
        data: { avatarUrl: null }
    });
    return res.status(200).json({message: "Avatar removed successfully.", avatarUrl: null});
}