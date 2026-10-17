import { useEffect, useState } from "react";
import { getProgressSummary } from "../features/progress/progress.api";
import type { ProgressSummary } from "../features/progress/progress.types";
import LoadingState from "../components/states/LoadingState";
import ErrorState from "../components/states/ErrorState";
import Leaderboard, { fakeLeaderboard } from "../features/progress/Leaderboard";
import GymBroOfTheMonth from "../features/progress/GymBroOfTheMonth";
import { useAuth } from "../features/auth/AuthContext";

const XP_PER_WORKOUT = 100;
const XP_PER_LEVEL = 1000;

export default function Progress() {
    const { user } = useAuth();
    const [summary, setSummary] = useState<ProgressSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getProgressSummary()
            .then(setSummary)
            .catch(() => setError("Could not load progress"));
    }, []);

    if (error) {
        return <ErrorState message={error} />;
    }

    if (!summary) {
        return <LoadingState message="Loading progress..." />;
    }

    const totalXp = summary.completedWorkouts * XP_PER_WORKOUT;
    const level = Math.floor(totalXp / XP_PER_LEVEL);
    const levelXp = totalXp % XP_PER_LEVEL;
    const xpPercentage = (levelXp / XP_PER_LEVEL) * 100;

    return (
        <section className="flex min-h-full flex-col px-6 py-10">
            <h1 className="text-3xl font-semibold">progress</h1>
            <div
                className="mt-3 w-full rounded-md border-2 border-app-border bg-app-surface px-6 py-8 sm:px-9 sm:py-10"
            >
                <div className="flex items-center gap-4">
                    <div
                        className="h-11 min-w-0 flex-[0_0_86%] overflow-hidden rounded-md border-2 border-app-primary-muted bg-app-canvas"
                        role="progressbar"
                        aria-valuenow={levelXp}
                        aria-valuemin={0}
                        aria-valuemax={XP_PER_LEVEL}
                        aria-label={`Level ${level} XP progress`}
                    >
                        <div
                            className="h-full rounded-[3px] bg-app-primary/20 transition-[width]"
                            style={{ width: `${xpPercentage}%` }}
                        />
                    </div>
                    <div className="flex shrink-0 flex-col items-center">
                        <span className="rounded-md border-2 border-app-primary bg-app-primary px-3 py-1 text-sm font-bold tracking-wide text-app-canvas">
                            LEVEL {level}
                        </span>
                        <span className="mt-1 text-xs text-app-text-muted">current level</span>
                    </div>
                </div>
                <div className="mt-4 grid grid-cols-[86%_1fr] text-sm text-app-text-secondary">
                    <span>{levelXp} / {XP_PER_LEVEL} XP earned</span>
                    <span>{xpPercentage}% progress</span>
                </div>
            </div>
            <div className="mt-6 flex w-full flex-col items-stretch gap-6 md:flex-row">
                <Leaderboard username={user?.username ?? null} xp={totalXp} />
                <GymBroOfTheMonth
                    username={fakeLeaderboard[0].username}
                    xp={fakeLeaderboard[0].xp}
                />
            </div>
        </section>
    );
}
