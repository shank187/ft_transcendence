import type { Request, Response, NextFunction } from "express";

const EXPERIENCE_LEVELS = ["BEGINNER", "INTERMEDIATE", "ADVANCED"];

const TRAINING_GOALS = [ "BUILD_MUSCLE", "GAIN_STRENGTH", "LOSE_FAT", "IMPROVE_GENERAL_FITNESS", "IMPROVE_ENDURANCE", "MAINTAIN_FITNESS"];

const UNIT_SYSTEMS = ["METRIC", "IMPERIAL"];

export const validate_profile = (req: Request, res: Response, next: NextFunction) => {
    const user = req.body?.user;

    if (!user || typeof user !== "object" || Array.isArray(user))
        return res.status(400).json({ message: "Invalid profile data." });

    if (typeof user.displayName !== "string" || user.displayName.trim() === "")
        return res.status(400).json({ message: "Display name is required." });

    if (typeof user.displayName !== "string" || user.displayName.trim().length < 1 || user.displayName.trim().length > 50)
    return res.status(400).json({ message: "Display name must be between 1 and 50 characters." });

    if (user.bio !== null && (typeof user.bio !== "string" || user.bio.length > 300))
        return res.status(400).json({ message: "Bio must be text with at most 300 characters." });

    if (typeof user.experienceLevel !== "string" || !EXPERIENCE_LEVELS.includes(user.experienceLevel))
        return res.status(400).json({ message: "Invalid experience level." });

    if (typeof user.primaryGoal !== "string" || !TRAINING_GOALS.includes(user.primaryGoal))
        return res.status(400).json({ message: "Invalid primary goal." });

    if (typeof user.unitSystem !== "string" || !UNIT_SYSTEMS.includes(user.unitSystem))
        return res.status(400).json({ message: "Invalid unit system." });

    if (user.weightKg !== null && ( typeof user.weightKg !== "number" || !Number.isFinite(user.weightKg) || user.weightKg < 20 || user.weightKg > 500))
        return res.status(400).json({ message: "Weight must be between 20 and 500 kg." });

    if (user.heightCm !== null && (typeof user.heightCm !== "number" || !Number.isFinite(user.heightCm) || user.heightCm < 20 || user.heightCm > 300))
        return res.status(400).json({ message: "Height must be between 20 and 300 cm." });

    next();
};