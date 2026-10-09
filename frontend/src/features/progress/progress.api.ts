import api from "../auth/axiosInstance";
import type { ProgressSummary } from "./progress.types";

export async function getProgressSummary(): Promise<ProgressSummary> {
    const response = await api.get<ProgressSummary>("/api/progress/summary");
    return response.data;
}
