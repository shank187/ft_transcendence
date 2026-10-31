
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

const XP_PER_WORKOUT = 100;
const XP_PER_LEVEL = 1000;

export default function Progress() {
    const { user } = useAuth();

    const [activeTab, setActiveTab] = useState("progress");
    const [summary, setSummary] = useState<ProgressSummary | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        getProgressSummary()
            .then((data) => setSummary(data))
            .catch(() => setError("Could not load progress"));
    }, []);

    if (error) {
        return <ErrorState message={error} />;
    }

    if (!summary) {
        return <LoadingState message="Loading progress..." />;
    }

    // XP calculations
    const totalXp = summary.completedWorkouts * XP_PER_WORKOUT;
    const level = Math.floor(totalXp / XP_PER_LEVEL);
    const levelXp = totalXp % XP_PER_LEVEL;
    const xpPercentage = (levelXp / XP_PER_LEVEL) * 100;

    // Leaderboard
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
        <section className="p-6">
            <ProgressTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* PROGRESS TAB */}
            {activeTab === "progress" && (
                <div className="mt-6">
                    <h1 className="text-2xl font-bold">
                        Your Progress
                    </h1>

                    <p className="mt-2 text-app-text-secondary">
                        Track your workouts and level up.
                    </p>

                    {/* XP PROGRESS BAR */}
                    <div className="mt-6 rounded border border-app-border bg-app-surface p-4">
                        <h2 className="font-bold">
                            Level {level}
                        </h2>

                        <div
                            className="mt-4 h-6 w-full overflow-hidden rounded bg-app-canvas"
                            role="progressbar"
                            aria-valuenow={levelXp}
                            aria-valuemin={0}
                            aria-valuemax={XP_PER_LEVEL}
                            aria-label={`Level ${level} XP progress`}
                        >
                            <div
                                className="h-full bg-app-primary"
                                style={{ width: `${xpPercentage}%` }}
                            />
                        </div>

                        <p className="mt-2 text-sm">
                            {levelXp} / {XP_PER_LEVEL} XP ({xpPercentage}%)
                        </p>
                    </div>

                    {/* LEADERBOARD AND GYM BRO */}
                    <div className="mt-6 flex flex-col gap-6 md:flex-row">
                        <Leaderboard
                            entries={leaderboardEntries}
                            currentUserId={user?.id ?? null}
                        />

                        {leaderboardWinner && (
                            <GymBroOfTheMonth
                                username={leaderboardWinner.username}
                                xp={leaderboardWinner.xp}
                            />
                        )}
                    </div>
                </div>
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
                    <h1 className="text-2xl font-bold">
                        Analytics
                    </h1>

                    <p className="mt-2 text-app-text-secondary">
                        Your workout analytics.
                    </p>
                </div>
            )}
        </section>
    );
}
