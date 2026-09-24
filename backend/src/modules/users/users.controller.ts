import { Response } from 'express';
import { prisma } from '../../lib/prisma';
import { AuthenticatedRequest } from '../../middleware/authenticate';

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

        if (heightCm && (heightCm < 50 || heightCm > 300))
            return res.status(400).json({ message: "Height must be between 50 and 300 cm" });

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
            avatarUrl: true,
            experienceLevel: true,
            bio: true,
            primaryGoal: true,
            unitSystem: true,
            weightKg: true,
            heightCm: true,
            onboardingCompletedAt: true
        }
    });

    if(!user)
        return res.status(404).json({message : "User not found"});

    return res.json(user);
};



function validate_profile(
    displayName: string,
    bio: string,
    // avatarUrl: string | null,
    experienceLevel: string,
    primaryGoal: string,
    unitSystem: string,
    heightCm: number | null,
    weightKg: number | null): string | null
{
    if (typeof displayName !== "string" ||displayName.trim().length === 0 || displayName.trim().length > 50)
        return "Invalid display name";

    if (typeof bio !== "string" ||bio.length > 300)
        return "Invalid bio";

    if (typeof experienceLevel !== "string" ||!EXPERIENCE_LEVELS.includes(experienceLevel))
        return "Invalid experience level";

    if (typeof primaryGoal !== "string" ||!TRAINING_GOALS.includes(primaryGoal))
        return "Invalid primary goal";

     if (typeof unitSystem !== "string" ||!UNIT_SYSTEMS.includes(unitSystem))
        return "Invalid unit system";

    if (heightCm !== null &&(typeof heightCm !== "number" ||!Number.isFinite(heightCm) ||heightCm < 50 || heightCm > 300))
        return "Invalid height";

    if (weightKg !== null &&(typeof weightKg !== "number" ||!Number.isFinite(weightKg) ||weightKg < 20 || weightKg >500 ))
        return "Invalid weight";


    return null;
}

//isfifnit !!!!returns true only when the value is a normal, usable number.



export const update_me = async( req: AuthenticatedRequest, res: Response) => {
    const {displayName,bio,experienceLevel,primaryGoal,unitSystem,heightCm,weightKg} = req.body;

    const error_mssg = validate_profile(displayName,bio,experienceLevel,primaryGoal,unitSystem,heightCm,weightKg);
    if (error_mssg)
        return res.status(400).json({message : error_mssg});


    try
    {
        const updated_user = await prisma.user.update({
            where:{
                id: req.userId,
            },
            data:{
                displayName: displayName.trim(),
                bio: bio.trim() || null,
                experienceLevel,
                primaryGoal,
                unitSystem,
                heightCm,
                weightKg,
            },
            select:{
                id: true,
                username: true,
                email: true,
                displayName: true,
                avatarUrl: true,
                bio: true,
                experienceLevel: true,
                primaryGoal: true,
                unitSystem: true,
                heightCm: true,
                weightKg: true,
                onboardingCompletedAt: true,
            },
        });
        return res.status(200).json({
            message: "Profile updated successfully",
            user: updated_user,
        }); 


    }catch
    {
        return res.status(500).json({message: "Internal server error"});
    }
};



export const upload_avatar = async (req: AuthenticatedRequest, res: Response) => {
    if (!req.userId)
        return res.status(401).json({message: "Unauthorized"});

    if (!req.file)
        return res.status(400).json({message: "No image uploaded"});


    const avatarPath ="/uploads/avatars/" +req.file.filename;

    try {
        const updatedUser = await prisma.user.update({
                where: {
                    id: req.userId,
                },

                data: {
                    avatarUrl: avatarPath
                },

                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                }
            });

        return res.status(200).json({
            message: "Avatar uploaded successfully",
            user: updatedUser
        });
    } catch {
        return res.status(500).json({message:"Internal server error"});
    }
};