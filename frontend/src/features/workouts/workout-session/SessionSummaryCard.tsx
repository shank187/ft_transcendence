import { Link } from "react-router-dom";
import { Check, Trophy } from "lucide-react";
import { formatElapsed } from "./workout-session.helpers";
import { EXERCISE_FIELDS } from "../shared/exercise-fields";
import { FIELDS_BY_UNIT, KG_PER_LB, type UnitSystem } from "../shared/set-values";
import { useUnitSystem } from "../shared/use-unit-system";
import type { AwardResult, WorkoutSessionExercise, WorkoutSessionSet, WorkoutSummary } from "../shared/workouts.types";

interface SessionSummaryCardProps {
    name: string
    summary: WorkoutSummary
    exercises: WorkoutSessionExercise[]
    // null after a reload: only the finish response carries it.
    award: AwardResult | null
}

const volumeFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })

// "82.5 kg × 6", "180 lb × 6", "12 reps", "1:30". Weight and distance carry their unit.
function setValueText(exercise: WorkoutSessionExercise, set: WorkoutSessionSet, units: UnitSystem): string
{
    const fields = EXERCISE_FIELDS[exercise.exerciseSummary.type]
    const fieldDefs = FIELDS_BY_UNIT[units]
    if (fields.length === 1 && fields[0].key === "reps")
        return `${set.reps ?? 0} reps`
    return fields.map(({ key }) => {
        const unit = key === "weight" || key === "distance" ? ` ${fieldDefs[key].label.toLowerCase()}` : ""
        return `${fieldDefs[key].format(set[key])}${unit}`
    }).join(" × ")
}

export default function SessionSummaryCard(props: SessionSummaryCardProps)
{
    const units = useUnitSystem()
    const { summary, award } = props
    const prIds = new Set(summary.prSetIds)
    const prs = props.exercises.flatMap(exercise =>
        exercise.sets
            .filter(set => prIds.has(set.id))
            .map(set => ({ id: set.id, name: exercise.exerciseSummary.name, value: setValueText(exercise, set, units) })))
    const stats = [
        { label: "TIME", value: formatElapsed(summary.durationSeconds * 1000), unit: "" },
        { label: "SETS", value: String(summary.setsCompleted), unit: "" },
        units === "IMPERIAL"
            ? { label: "VOLUME", value: volumeFormat.format(summary.volumeKg / KG_PER_LB), unit: " lb" }
            : { label: "VOLUME", value: volumeFormat.format(summary.volumeKg), unit: " kg" },
        { label: "EXERCISES", value: String(summary.exerciseCount), unit: "" },
    ]

    return(
        <section aria-labelledby="summary-title" className="flex flex-col gap-4">
            <header className="flex flex-col items-center gap-2 text-center md:flex-row md:gap-4 md:text-left">
                <span className="flex size-16 shrink-0 items-center justify-center rounded-full bg-app-primary/12 text-app-primary">
                    <Check aria-hidden="true" className="size-8" strokeWidth={3} />
                </span>
                <div className="flex flex-col gap-1">
                    <h1 id="summary-title" className="text-[26px] font-bold tracking-tight md:text-[28px]">Workout complete</h1>
                    <p className="text-sm text-app-text-secondary">{props.name}</p>
                </div>
            </header>

            <dl className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
                {stats.map(stat =>
                    <div key={stat.label} className="flex flex-col-reverse gap-0.5 rounded-2xl border border-app-border bg-app-surface p-3.5 md:px-4">
                        <dt className="text-xs font-semibold tracking-wider text-app-text-secondary">{stat.label}</dt>
                        <dd className="text-[26px] font-bold tabular-nums">
                            {stat.value}<span className="text-sm font-semibold text-app-text-secondary">{stat.unit}</span>
                        </dd>
                    </div>
                )}
            </dl>

            <div className="grid gap-2.5 md:grid-cols-2">
                <section className="flex flex-col gap-2.5 rounded-2xl border border-app-border bg-app-surface p-3.5 md:p-4">
                    <h2 className="flex items-center gap-2 text-[15px] font-bold text-amber-400">
                        <Trophy aria-hidden="true" className="size-4.5" />
                        {prs.length === 0 ? "No new records" : `${prs.length} new personal ${prs.length === 1 ? "record" : "records"}`}
                    </h2>
                    {prs.length > 0
                        ? <ul className="flex flex-col gap-2">
                            {prs.map(pr =>
                                <li key={pr.id} className="flex items-baseline justify-between gap-3 text-sm">
                                    <span className="min-w-0 truncate">{pr.name}</span>
                                    <strong className="shrink-0 font-bold tabular-nums">{pr.value}</strong>
                                </li>
                            )}
                        </ul>
                        : <p className="text-sm text-app-text-secondary">Beat a best set to earn one next time.</p>
                    }
                </section>
                {award &&
                    <section role="status" className="flex flex-col justify-center gap-2 rounded-2xl border border-app-border bg-app-surface p-3.5 md:p-4">
                        <div className="flex flex-wrap items-baseline justify-between gap-3">
                            <strong className="text-xl font-bold tabular-nums text-app-primary">+{award.xpGained} XP</strong>
                            {award.levelUp && <span className="rounded-full bg-app-primary/12 px-2.5 py-0.5 text-[13px] font-semibold text-app-primary">Level up!</span>}
                        </div>
                        {award.unlocked.length > 0 && <p className="text-sm text-app-text-secondary">Unlocked: {award.unlocked.join(", ")}</p>}
                    </section>
                }
            </div>

            <div className="grid grid-cols-2 gap-2.5">
                <Link to="/progress" className="flex h-12 items-center justify-center rounded-lg border border-app-border text-[15px] font-semibold hover:bg-app-surface-hover">
                    View progress
                </Link>
                <Link to="/workouts" className="flex h-12 items-center justify-center rounded-lg bg-app-primary text-[15px] font-bold text-app-canvas hover:brightness-110">
                    Done
                </Link>
            </div>
        </section>
    )
}
