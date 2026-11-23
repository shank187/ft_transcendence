import { Link } from "react-router-dom"
import { CalendarPlus, Play } from "lucide-react"
import Card from "../../../components/ui/Card"
import StartDayButton from "./StartDayButton"
import type { HomeDay } from "./workouts.types"

export type NextDayState =
    | { status: "loading" }
    | { status: "success"; result: HomeDay | null }
    | { status: "failure"; message: string }

interface NextWorkoutCardProps {
    state: NextDayState
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

                    {/* mt-auto: the button sits at the bottom when the grid row makes this card taller. */}
                    <div className="mt-auto">
                        {day.activeSessionId
                            ? <Link to={`/workouts/session/${day.activeSessionId}`} className="flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-app-primary text-[15px] font-bold text-app-canvas hover:brightness-110">
                                <Play aria-hidden="true" className="size-4" fill="currentColor" strokeWidth={0} />
                                Resume workout
                            </Link>
                            : <StartDayButton dayId={day.id} className="[&>button]:min-h-12 [&>button]:w-full [&>button]:text-[15px]" />
                        }
                    </div>
                </div>
            }
        </Card>
    )
}
