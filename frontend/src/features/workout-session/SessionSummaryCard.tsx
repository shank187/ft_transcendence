import { Link, useNavigate } from "react-router-dom";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import { buttonClasses } from "../../components/ui/button-classes";
import { formatElapsed } from "./workout-session.helpers";
import type { AwardResult, WorkoutSummary } from "./workout-session.types";

const volumeFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })

function plural(count: number, word: string): string
{
    return `${count} ${count === 1 ? word : `${word}s`}`
}

export default function SessionSummaryCard(props:{
    summary: WorkoutSummary
    award: AwardResult | null
})
{
    const navigate = useNavigate()
    const { summary, award } = props
    const stats = [
        { label: "Duration", value: formatElapsed(summary.durationSeconds * 1000) },
        { label: "Sets", value: `${summary.setsCompleted} / ${summary.setsTotal} sets` },
        { label: "Volume", value: `${volumeFormat.format(summary.volumeKg)} kg` },
        { label: "Exercises", value: plural(summary.exerciseCount, "exercise") },
        { label: "Records", value: plural(summary.prSetIds.length, "PR") },
    ]

    return(
        <Card className="flex flex-col gap-5 p-5">
            <h2 className="text-lg font-semibold">Workout summary</h2>
            {award &&
                <div role="status" className="flex flex-col gap-1 rounded-md border border-app-primary/40 bg-app-primary/10 p-3 text-app-primary">
                    <p className="text-lg font-semibold">+{award.xpGained} XP</p>
                    {award.levelUp && <p>Level up!</p>}
                    {award.unlocked.length > 0 && <p>Unlocked: {award.unlocked.join(", ")}</p>}
                </div>
            }
            <dl className="grid grid-cols-2 gap-3">
                {stats.map(stat =>
                    <div key={stat.label} className="flex flex-col gap-0.5">
                        <dt className="text-xs text-app-text-muted">{stat.label}</dt>
                        <dd className="font-medium">{stat.value}</dd>
                    </div>
                )}
            </dl>
            <div className="flex flex-wrap gap-3">
                <Link to="/progress" className={buttonClasses("secondary", "min-h-11 flex-1 border border-app-border")}>
                    View Progress
                </Link>
                <Button className="min-h-11 flex-1" onClick={() => navigate("/workouts")}>Done</Button>
            </div>
        </Card>
    )
}
