
import { Trophy, Medal, Zap } from "lucide-react";
import { achievements } from "./achievements.data";
import AchievementCard from "./AchievementCard";

type AchievementsProps = {
    completedWorkouts: number;
};

export default function Achievements({
    completedWorkouts,
}: AchievementsProps) {

    // Requirements for each achievement
    const requirements: Record<number, number> = {
        1: 1,
        4: 10,
        5: 50,
        6: 100,
    };

    // Calculate unlock status using the user's workouts
    const userAchievements = achievements.map((achievement) => ({
        ...achievement,
        unlocked: completedWorkouts >= requirements[achievement.id],
    }));

    // Calculate achievement statistics
    const totalAchievements = userAchievements.length;

    const unlockedAchievements = userAchievements.filter(
        (achievement) => achievement.unlocked
    ).length;

    const progressPercentage =
        totalAchievements > 0
            ? Math.round(
                  (unlockedAchievements / totalAchievements) * 100
              )
            : 0;

    return (
        <div className="mt-6 flex w-full flex-col gap-6">

            {/* ACHIEVEMENTS HEADER */}
            <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-3xl border border-app-primary bg-teal-900/60 shadow-lg shadow-teal-500/20">
                    <Trophy className="h-9 w-9 text-app-primary" />
                </div>

                <div>
                    <div className="text-3xl font-bold">
                        Achievements
                    </div>

                    <div className="mt-1 text-app-text-secondary">
                        Unlock milestones. Earn your glory.
                    </div>
                </div>
            </div>

            {/* ACHIEVEMENT SUMMARY CARD */}
            <div className="w-full rounded-xl border border-app-border bg-app-surface p-6 shadow-lg shadow-teal-500/10 sm:p-8">

                {/* TOP SECTION */}
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <div className="text-xs font-semibold uppercase tracking-widest text-app-text-secondary">
                            Your Achievement Journey
                        </div>

                        <div className="mt-3 flex items-baseline gap-3">
                            <div className="text-4xl font-bold text-app-primary">
                                {unlockedAchievements}
                                    {" / "}{totalAchievements}
                            </div>

                            <div className="text-sm text-app-text-secondary">
                                Unlocked
                            </div>
                        </div>
                    </div>

                    {/* MEDAL ICON */}
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-yellow-500/30 bg-yellow-500/10">
                        <Medal className="h-9 w-9 text-yellow-400" />
                    </div>
                </div>

                {/* PROGRESS SECTION */}
                <div className="mt-8">
                    <div className="mb-3 flex items-center justify-between gap-4">
                        <div className="text-sm font-medium text-app-text-secondary">
                            Total completion
                        </div>

                        <div className="text-sm font-bold text-app-primary">
                            {progressPercentage}%
                        </div>
                    </div>

                    {/* PROGRESS BAR */}
                    <div
                        className="h-3 w-full overflow-hidden rounded-full bg-app-canvas"
                        role="progressbar"
                        aria-label="Achievements completion"
                        aria-valuenow={progressPercentage}
                        aria-valuemin={0}
                        aria-valuemax={100}
                    >
                        <div
                            className="h-full rounded-full bg-app-primary shadow-lg shadow-teal-400/40 transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                        />
                    </div>
                </div>

                {/* FOOTER */}
                <div className="mt-6 flex items-center gap-2">
                    <Zap className="h-4 w-4 shrink-0 text-yellow-400" />

                    <p className="text-sm text-app-text-secondary">
                        Your next milestone is waiting.
                    </p>
                </div>
            </div>

            {/* ACHIEVEMENT COLLECTION */}
            <div className="mt-4">
                <div className="mb-5 flex items-center justify-between">
                    <div className="text-2xl font-bold">
                        All Achievements
                    </div>

                    <div className="text-sm text-app-text-secondary">
                        {totalAchievements} milestones
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {userAchievements.map((achievement) => (
                        <AchievementCard

                            key={achievement.id}
                            achievement={achievement}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
