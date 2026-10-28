
import { useEffect, useState } from "react";
import { getProgressSummary } from "../features/progress/progress.api";
import type { ProgressSummary } from "../features/progress/progress.types";
import LoadingState from "../components/states/LoadingState";
import ErrorState from "../components/states/ErrorState";
import Leaderboard, { fakeLeaderboard } from "../features/progress/Leaderboard";
import GymBroOfTheMonth from "../features/progress/GymBroOfTheMonth";
import { useAuth } from "../features/auth/AuthContext";
import ProgressTabs from "../features/progress/ProgressTabs";
import Achievements from "../features/progress/Achievements";
import { TrendingUp } from "lucide-react"
const XP_PER_WORKOUT = 100;
const XP_PER_LEVEL = 1000;

export default function Progress() {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState("progress");
    const [summary, setSummary] = useState<ProgressSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getProgressSummary()
            .then((data) => {
                console.log("Progress summary:", data);
                console.log(
                    "Completed workouts:",
                    data.completedWorkouts
                );

                setSummary(data);
            })
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

    const leaderboardEntries = user
        ? [
              ...fakeLeaderboard,
              {
                  id: user.id,
                  username: user.username,
                  xp: totalXp,
              },
          ].sort((a, b) => b.xp - a.xp)
        : fakeLeaderboard;

    const leaderboardWinner = leaderboardEntries[0];

    return (
        <section className="flex min-h-full flex-col px-6 py-10">
            <ProgressTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* PROGRESS TAB */}
            {activeTab === "progress" && (
                <>
                    {/* PROGRESS HEADER*/}
                            <div className="mt-6 mb-6 flex items-center gap-4">
                                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-app-primary bg-teal-900/60 shadow-lg shadow-teal-500/20">
                                    <TrendingUp className="h-9 w-9 text-app-primary" />
                                </div>

                                <div>
                                    <h1 className="text-3xl font-bold">
                                        Your Progress
                                    </h1>

                                    <p className="mt-1 text-app-text-secondary">
                                        Track your workouts. Level up your journey.
                                    </p>
                                </div>
                            </div>
                    {/* XP PROGRESS BAR */}
                    <div className="mt-3 w-full rounded-md border-2 border-app-border bg-app-surface px-6 py-8 sm:px-9 sm:py-10">
                        <div className="flex items-center gap-4">
                            <div
                                className="h-11 min-w-0 flex-1 overflow-hidden rounded-md border-2 border-app-primary-muted bg-app-canvas"
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
                                <span className="rounded-md border-2 border-app-primary bg-app-primary px-1 py-0 text-sm font-bold tracking-wide text-app-canvas">
                                    LEVEL {level}
                                </span>

                                <span className="mt-1 text-xs text-app-text-muted">
                                    current level
                                </span>
                            </div>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-4 text-sm text-app-text-secondary">
                            <span>
                                {levelXp} / {XP_PER_LEVEL} XP earned
                            </span>

                            <span>{xpPercentage}% progress</span>
                        </div>
                    </div>

                    {/* LEADERBOARD AND GYM BRO */}
                    <div className="mt-6 flex w-full flex-col items-stretch gap-6 md:flex-row">
                        <Leaderboard
                            entries={leaderboardEntries}
                            currentUserId={user?.id ?? null}
                        />

                        <GymBroOfTheMonth
                            username={leaderboardWinner.username}
                            xp={leaderboardWinner.xp}
                        />
                    </div>
                </>
            )}

            {/* ACHIEVEMENTS TAB */}
            {activeTab === "Achievements" && (
                <Achievements
                    completedWorkouts={summary.completedWorkouts}
                />
            )}

            {/* ANALYTICS TAB */}
            {activeTab === "Analytics" && (
                <div className="mt-6">
                    <h2 className="text-2xl font-semibold">
                        Analytics
                    </h2>

                    <p className="mt-2 text-app-text-secondary">
                        Workout analytics will appear here.
                    </p>
                </div>
            )}
        </section>
    );
}
