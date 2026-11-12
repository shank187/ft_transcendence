export type ProgressTab = "Progress" | "Achievements" | "Analytics";


export type LeaderboardEntry = {
    id: string;
    username: string;
    xp: number;
};

export type SavedAchievements = {
    code: string;
    unlockedAt: string;
};

export type ProgressSummary = {
    completedWorkouts: number;
    totalXp: number;
    achievements: SavedAchievements[];
};
