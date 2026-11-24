import { Zap } from "lucide-react";
import Card from "../../components/ui/Card";

type ProfileXpCardProps = {
    totalXp: number;
    level: number;
};

const XP_PER_LEVEL = 500;

export default function ProfileXpCard({
    totalXp,
    level,
}: ProfileXpCardProps) {
    const levelXp = totalXp % XP_PER_LEVEL;
    const percentage = (levelXp / XP_PER_LEVEL) * 100;

    return (
        <Card className="min-w-0 space-y-4 border border-app-border">
            <h2 className="text-sm text-app-text-secondary">
                Level
            </h2>

            <p className="flex items-center gap-2 text-3xl font-bold">
                <Zap
                    className="h-6 w-6 text-app-primary"
                    aria-hidden="true"
                />
                {level}
            </p>

            <p className="text-sm text-app-text-secondary">
                {totalXp.toLocaleString()} total XP
            </p>

            <div
                role="progressbar"
                aria-label={`XP progress toward level ${level + 1}`}
                aria-valuemin={0}
                aria-valuemax={XP_PER_LEVEL}
                aria-valuenow={levelXp}
                className="h-2 overflow-hidden rounded-full bg-app-border"
            >
                <div
                    className="h-full rounded-full bg-app-primary transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <p className="text-xs text-app-text-secondary">
                {levelXp} / {XP_PER_LEVEL} XP toward level {level + 1}
            </p>
        </Card>
    );
}