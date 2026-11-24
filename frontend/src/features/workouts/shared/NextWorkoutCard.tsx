import { Link } from "react-router-dom"
import { CalendarPlus, ChevronRight, Play, Plus, TrendingUp } from "lucide-react"
import Card from "../../../components/ui/Card"
import StartDayButton from "./StartDayButton"
import { KG_PER_LB, formatDuration } from "./set-values"
import { useUnitSystem } from "./use-unit-system"
import type { HomeDay, LastDayWorkout } from "./workouts.types"

export type NextDayState =
    | { status: "loading" }
    | { status: "success"; result: HomeDay | null }
    | { status: "failure"; message: string }

interface NextWorkoutCardProps {
    state: NextDayState
}

// Same rounding as the volume on the workout summary.
const volumeFormat = new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 })

// Calendar days in the user's time zone: a workout at 23:00 yesterday is "yesterday", not "today".
function daysAgoLabel(iso: string): string
{
    const then = new Date(iso)
    const now = new Date()
    const thenDay = new Date(then.getFullYear(), then.getMonth(), then.getDate()).getTime()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    // round, not floor: a day is 23 or 25 hours long when the clocks change.
    const days = Math.round((today - thenDay) / 86_400_000)
    if (days <= 0) return "today"
    if (days === 1) return "yesterday"
    return `${days} days ago`
}

interface LastTimeProps {
    lastTime: LastDayWorkout | null
}

// What the user did the last time they finished this day, and the number to beat today.
function LastTime({ lastTime }: LastTimeProps)
{
    const units = useUnitSystem()
    if (!lastTime)
        return (
            <p className="flex items-center gap-2 rounded-xl border border-app-border px-3.5 py-3 text-sm text-app-text-secondary">
                <TrendingUp aria-hidden="true" className="size-4 shrink-0 text-app-primary" />
                First time on this day: today sets your baseline.
            </p>
        )

    const volume = volumeFormat.format(units === "IMPERIAL" ? lastTime.volumeKg / KG_PER_LB : lastTime.volumeKg)
    const unit = units === "IMPERIAL" ? "lb" : "kg"
    const sets = `${lastTime.setsCompleted} ${lastTime.setsCompleted === 1 ? "set" : "sets"}`
    // Volume needs weight and reps; a day of bodyweight or timed sets has none, so the sets are the target.
    const target = lastTime.volumeKg > 0 ? `Beat ${volume} ${unit} of volume today` : `Beat ${sets} today`

    return (
        <section aria-label="Last time" className="flex flex-col gap-2 rounded-xl border border-app-border px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-3">
                <h4 className="text-xs font-semibold tracking-wider text-app-text-secondary">
                    LAST TIME · {daysAgoLabel(lastTime.completedAt).toUpperCase()}
                </h4>
                <Link to={`/workouts/session/${lastTime.sessionId}`} aria-label="View your last workout of this day" className="-mr-1.5 flex min-h-11 items-center gap-0.5 px-1.5 text-sm font-semibold text-app-primary hover:underline">
                    View
                    <ChevronRight aria-hidden="true" className="size-4" />
                </Link>
            </div>
            <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-app-text-secondary">
                {lastTime.volumeKg > 0 && <span><strong className="text-base font-bold tabular-nums text-app-text">{volume}</strong> {unit}</span>}
                <span><strong className="text-base font-bold tabular-nums text-app-text">{lastTime.setsCompleted}</strong> {lastTime.setsCompleted === 1 ? "set" : "sets"}</span>
                <span><strong className="text-base font-bold tabular-nums text-app-text">{formatDuration(lastTime.durationSeconds)}</strong> time</span>
            </p>
            <p className="flex items-center gap-2 text-sm font-semibold text-app-primary">
                <TrendingUp aria-hidden="true" className="size-4 shrink-0" />
                {target}
            </p>
        </section>
    )
}

// Card, like the other Home cards, so the grid keeps one radius and padding.
export default function NextWorkoutCard(props: NextWorkoutCardProps)
{
    const { state } = props
    const day = state.status === "success" ? state.result : null
    const stats = day
        ? [
            { label: "Day", value: day.dayOrder },
            { label: day.exerciseCount === 1 ? "Exercise" : "Exercises", value: day.exerciseCount },
            { label: day.setCount === 1 ? "Set" : "Sets", value: day.setCount },
        ]
        : []

    return (
        <Card className="flex min-w-0 flex-col gap-5 border border-app-border">
            <h2 className="text-sm font-semibold uppercase">Next workout</h2>

            {state.status === "loading" &&
                <p role="status" className="text-app-text-secondary">Loading your next workout...</p>
            }
            {state.status === "failure" &&
                <p role="alert" className="text-sm text-app-danger">{state.message}</p>
            }
            {state.status === "success" && !day &&
                <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-app-border px-5 py-8 text-center">
                    <span className="flex size-14 items-center justify-center rounded-full bg-app-primary/10 text-app-primary">
                        <CalendarPlus aria-hidden="true" className="size-6.5" strokeWidth={1.75} />
                    </span>
                    <p className="max-w-64 text-sm text-app-text-secondary">Plan your training days and your next one shows up here.</p>
                    <Link to="/workouts" className="flex h-11 items-center rounded-lg border border-app-border px-4 text-sm font-semibold hover:bg-app-surface-hover">
                        Plan your workouts
                    </Link>
                </div>
            }
            {day &&
                <div className="flex flex-1 flex-col gap-5">
                    <div className="flex flex-col gap-1">
                        <h3 className="truncate text-2xl font-bold tracking-tight">{day.name}</h3>
                        {day.activeSessionId &&
                            <p className="flex items-center gap-2 text-sm font-semibold text-app-primary">
                                <span aria-hidden="true" className="size-2 rounded-full bg-app-primary" />
                                Workout in progress
                            </p>
                        }
                    </div>

                    <dl className="grid grid-cols-3 gap-2.5">
                        {stats.map(stat =>
                            <div key={stat.label} className="flex flex-col-reverse gap-0.5 rounded-xl bg-app-surface-raised px-3 py-2.5">
                                <dt className="text-xs font-semibold tracking-wider text-app-text-secondary">{stat.label}</dt>
                                <dd className="text-2xl font-bold tabular-nums">{stat.value}</dd>
                            </div>
                        )}
                    </dl>

                    {/* An empty day has nothing to beat yet; its button already says to add exercises. */}
                    {day.exerciseCount > 0 && <LastTime lastTime={day.lastTime} />}

                    {/* mt-auto: the button sits at the bottom when the grid row makes this card taller. */}
                    {/* An empty day opens its editor, like the plan page's day row: starting it would give an empty workout. */}
                    <div className="mt-auto">
                        {day.activeSessionId
                            ? <Link to={`/workouts/session/${day.activeSessionId}`} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-app-primary text-[15px] font-bold text-app-canvas hover:brightness-110">
                                <Play aria-hidden="true" className="size-4" fill="currentColor" strokeWidth={0} />
                                Resume workout
                            </Link>
                            : day.exerciseCount === 0
                                ? <Link to={`/workouts/plans/${day.planId}/days/${day.id}`} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg border border-app-primary text-[15px] font-bold text-app-primary hover:bg-app-primary/10">
                                    <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
                                    Add exercises
                                </Link>
                                : <StartDayButton dayId={day.id} className="[&>button]:min-h-12 [&>button]:w-full [&>button]:text-[15px]" />
                        }
                    </div>
                </div>
            }
        </Card>
    )
}
