export type ProgressTab = "Progress" | "Achievements" | "Analytics";

export type ProgressSummary = {
    completedWorkouts: number;
    totalXp: number;
};

export type LeaderboardEntry = {
    id: string;
    username: string;
    xp: number;
};