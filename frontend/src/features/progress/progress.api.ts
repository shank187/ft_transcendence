import api from "../auth/axiosInstance";
import type { ProgressSummary , LeaderboardEntry , WeeklyStats } from "./progress.types";

export async function getProgressSummary(): Promise<ProgressSummary> {
    const response = await api.get<ProgressSummary>("/api/progress/summary");
    
    return response.data;
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
    const response = await api.get<LeaderboardEntry[]>("/api/progress/leaderboard");

    return response.data;
}

export async function getWeeklyStats(): Promise<WeeklyStats> {
    const { data } = await api.get<WeeklyStats>("api/progress/week");
    return data;
}