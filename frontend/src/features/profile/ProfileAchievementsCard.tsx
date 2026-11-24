import { Trophy } from "lucide-react";
import Card from "../../components/ui/Card";

type ProfileAchievementsCardProps = {
    unlocked: number;
    total: number;
    latestTitle?: string;
};

export default function ProfileAchievementsCard({
    unlocked,
    total,
    latestTitle,
}: ProfileAchievementsCardProps) {
    const percentage = total > 0 ? (unlocked / total) * 100 : 0;

    return (
        <Card className="min-w-0 space-y-4 border border-app-border">
            <h2 className="text-sm text-app-text-secondary">
                Achievements
            </h2>

            <p className="flex items-center gap-2 text-3xl font-bold">
                <Trophy
                    className="h-6 w-6 text-app-primary"
                    aria-hidden="true"
                />
                {unlocked} / {total}
            </p>

            <p className="text-sm text-app-text-secondary">
                {latestTitle
                    ? `Latest: ${latestTitle}`
                    : "No achievements unlocked yet"}
            </p>

            <div
                role="progressbar"
                aria-label="Achievement completion"
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={percentage}
                className="h-2 overflow-hidden rounded-full bg-app-border"
            >
                <div
                    className="h-full rounded-full bg-app-primary transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <p className="text-xs text-app-text-secondary">
                {Math.round(percentage)}% unlocked
            </p>
        </Card>
    );
}