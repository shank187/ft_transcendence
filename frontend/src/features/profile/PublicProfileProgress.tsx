import { Moon, Sunrise, Trophy, Zap } from "lucide-react";
import Card from "../../components/ui/Card";
import { achievements } from "../progress/achievements.data";
import type { PublicProfile } from "./profile.types";
import ProfileXpCard from "./ProfileXpCard";
import ProfileAchievementsCard from "./ProfileAchievementsCard";

type PublicProfileProgressProps = {
    profile: PublicProfile;
};

export default function PublicProfileProgress({
    profile,
}: PublicProfileProgressProps) {
    const unlockedCodes = new Set(
        profile.achievements.map((achievement) => achievement.code)
    );

    const unlockedAchievements = achievements.filter((achievement) =>
        unlockedCodes.has(achievement.code)
    );

    const latestSaved = [...profile.achievements].sort(
        (a, b) =>
            new Date(b.unlockedAt).getTime() -
            new Date(a.unlockedAt).getTime()
    )[0];

    const latestAchievement = achievements.find(
        (achievement) => achievement.code === latestSaved?.code
    );

    return (
        <div className="mt-5 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
                    <ProfileXpCard
                        totalXp={profile.totalXp}
                        level={profile.level}
                    />

                    <ProfileAchievementsCard
                        unlocked={unlockedAchievements.length}
                        total={achievements.length}
                        latestTitle={latestAchievement?.title}
                    />
            </div>

            <Card className="space-y-4 border border-app-border">
                <h2 className="text-sm font-semibold uppercase tracking-wide">
                    Unlocked achievements
                </h2>

                {unlockedAchievements.length === 0 ? (
                    <p className="text-sm text-app-text-secondary">
                        No achievements unlocked yet.
                    </p>
                ) : (
                    <div className="flex flex-wrap gap-3">
                        {unlockedAchievements.map((achievement) => {
                            const Icon =
                                achievement.code === "EARLY_BIRD"
                                    ? Sunrise
                                    : achievement.code === "NIGHT_OWL"
                                      ? Moon
                                      : Trophy;

                            return (
                                <span
                                    key={achievement.code}
                                    title={achievement.description}
                                    className="inline-flex items-center gap-2 rounded-full border border-app-border px-3 py-2 text-sm"
                                >
                                    <Icon
                                        className="h-4 w-4 text-app-primary"
                                        aria-hidden="true"
                                    />
                                    {achievement.title}
                                </span>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
}