import { Response } from 'express';
import { prisma } from '../../app';
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