
import type { Achievement } from "./achievements.data";

import {
    LockKeyhole,
    CheckCircle2,
    Dumbbell,
    Sunrise,
    Moon,
} from "lucide-react";

type AchievementCardProps = {
    achievement: Achievement;
};
//!!!!!!!!!!!!!!
const achievementColors: Record<
    number,
    {
        icon: string;
        background: string;
        border: string;
        glow: string;
    }
> = {
    1: {
        icon: "text-amber-600",
        background: "bg-amber-700/15",
        border: "border-app-primary",
        glow: "",
    },
    2: {
        icon: "text-amber-600",
        background: "bg-amber-700/15",
        border: "border-app-primary",
        glow: "",
    },
    4: {
        icon: "text-slate-300",
        background: "bg-slate-300/10",
        border: "border-app-primary",
        glow: "",
    },
    5: {
        icon: "text-yellow-400",
        background: "bg-yellow-400/10",
        border: "border-app-primary",
        glow: "",
    },
    6: {
        icon: "text-purple-400",
        background: "bg-purple-400/10",
        border: "border-app-primary",
        glow: "",
    },
    
};

export default function AchievementCard({
    achievement,
}: AchievementCardProps) {
    const colors =
        achievementColors[achievement.id] ?? achievementColors[4];

    const Icon =
    achievement.code === "EARLY_BIRD"
        ? Sunrise
        : achievement.code === "NIGHT_OWL"
          ? Moon
          : Dumbbell;
    return (
            <div
                className={`flex flex-col gap-3 rounded-xl border p-5 transition-all duration-300 ${
                    achievement.unlocked
                        ? `${colors.border} ${colors.background} shadow-lg ${colors.glow}`
                        : "border-app-border bg-app-surface"
                }`}
            >
            {/* MEDAL ICON AND STATUS */}
            <div className="flex items-center justify-between">
                <div
                    className={`flex h-14 w-14 items-center justify-center rounded-xl border ${colors.background} ${colors.border}`}
                >
                    <Icon
                        className={`h-7 w-7 ${colors.icon}`}
                    />
                </div>

                {achievement.unlocked ?
                (<CheckCircle2 className="h-5 w-5 text-app-primary" 
                />):(
                <LockKeyhole className="h-5 w-5 text-app-text-muted" />
                )}
            </div>

            {/* ACHIEVEMENT INFORMATION */}
            <div>
                <div className="text-lg font-bold">
                    {achievement.title}
                </div>

                <div className="mt-1 text-sm text-app-text-secondary">
                    {achievement.description}
                </div>
            </div>

            {/* UNLOCK STATUS */}
            <div
                className={`mt-auto text-xs font-semibold tracking-wider ${
                    achievement.unlocked
                        ? "text-app-primary"
                        : "text-app-text-muted"
                }`}
            >
                {achievement.unlocked ? "UNLOCKED" : "LOCKED"}
            </div>
        </div>
    );
}
