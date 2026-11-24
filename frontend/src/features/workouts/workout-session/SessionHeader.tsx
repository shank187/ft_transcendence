import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../../components/ui/Button";
import { formatElapsed } from "./workout-session.helpers";
import type { WorkoutSessionStatus } from "../shared/workouts.types";

interface SessionHeaderProps {
    name: string
    startedAt: string
    finishedAt: string | null
    status: WorkoutSessionStatus
    doneCount: number
    totalCount: number
    isReadOnly: boolean
    finishing: boolean
    onFinish: () => void
    onDiscard: () => void
    // null when the workout is at its exercise limit.
    onAddExercise: (() => void) | null
}

interface SessionActionsProps {
    className: string
    canFinish: boolean
    onAddExercise: (() => void) | null
    finishing: boolean
    onFinish: () => void
    onDiscard: () => void
}

const STATUS_LABEL: Record<WorkoutSessionStatus, string> = {
    IN_PROGRESS: "In progress",
    COMPLETED: "Finished",
    CANCELLED: "Discarded",
}

export default function SessionHeader(props: SessionHeaderProps)
{
    const [now, setNow] = useState(() => Date.now())

    // The interval stops when the page closes or the workout becomes read-only.
    useEffect(() => {
        if(!props.isReadOnly)
        {
            const timer = setInterval(() => setNow(Date.now()), 1000)
            return () => clearInterval(timer)
        }
    }, [props.isReadOnly])

    const startedMs = new Date(props.startedAt).getTime()
    const finishedMs = props.status === "COMPLETED" && props.finishedAt ? new Date(props.finishedAt).getTime() : null
    const elapsed = !props.isReadOnly
        ? formatElapsed(now - startedMs)
        : finishedMs !== null ? formatElapsed(finishedMs - startedMs) : null
    const percent = props.totalCount === 0 ? 0 : Math.round(props.doneCount * 100 / props.totalCount)
    const actions = {
        canFinish: props.doneCount > 0 && !props.finishing,
        finishing: props.finishing,
        onFinish: props.onFinish,
        onDiscard: props.onDiscard,
        onAddExercise: props.onAddExercise,
    }

    return(
        <>
            <header className="sticky top-2 z-20 flex flex-col gap-3 rounded-2xl border border-app-border bg-app-surface px-4 py-3.5 shadow-lg shadow-black/50">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex min-w-0 flex-[1_1_8rem] flex-col gap-0.5">
                        <h1 className="truncate text-xl font-bold">{props.name}</h1>
                        {props.isReadOnly && <p className="text-[13px] text-app-text-secondary">{STATUS_LABEL[props.status]}</p>}
                    </div>
                    {elapsed !== null &&
                        <div className="flex flex-col items-end">
                            <time className="text-2xl font-bold tabular-nums text-app-primary">{elapsed}</time>
                            {!props.isReadOnly &&
                                <span className="text-[13px] tabular-nums text-app-text-secondary">{props.doneCount} / {props.totalCount} sets</span>
                            }
                        </div>
                    }
                    {!props.isReadOnly && <SessionActions className="hidden md:flex" {...actions} />}
                </div>
                {!props.isReadOnly &&
                    <div
                    role="progressbar"
                    aria-label="Sets done"
                    aria-valuenow={props.doneCount}
                    aria-valuemin={0}
                    aria-valuemax={props.totalCount}
                    className="h-1 overflow-hidden rounded-full bg-app-surface-hover"
                    >
                        <div className="h-full rounded-full bg-app-primary transition-[width] duration-300" style={{ width: `${percent}%` }} />
                    </div>
                }
            </header>
            {/* Phones: above the S1 bottom nav (48 px), which this page can't change. */}
            {!props.isReadOnly &&
                <div className="fixed inset-x-0 bottom-12 z-40 border-t border-app-border bg-app-surface-raised px-4 py-3 md:hidden">
                    <SessionActions className="flex" {...actions} />
                </div>
            }
        </>
    )
}

function SessionActions(props: SessionActionsProps)
{
    return(
        <div className={`gap-2.5 ${props.className}`}>
            {/* Icon only on phones, where the bar also holds Discard and Finish. */}
            {props.onAddExercise &&
                <button
                type="button"
                aria-label="Add exercise"
                title="Add exercise"
                onClick={props.onAddExercise}
                className="flex h-12 min-w-12 shrink-0 items-center justify-center gap-1.5 rounded-lg border border-app-primary text-sm font-semibold text-app-primary hover:bg-app-primary/10 md:h-11 md:px-3.5"
                >
                    <Plus aria-hidden="true" className="size-5 md:size-4" strokeWidth={2.5} />
                    <span className="hidden md:inline">Add exercise</span>
                </button>
            }
            {/* A plain button: every Button variant sets its own text colour. */}
            <button
            type="button"
            disabled={props.finishing}
            onClick={props.onDiscard}
            className="h-12 rounded-lg border border-app-border px-4 text-sm font-semibold text-app-danger hover:border-app-danger disabled:cursor-not-allowed disabled:opacity-50 md:h-11"
            >
                Discard
            </button>
            <Button disabled={!props.canFinish} onClick={props.onFinish} className="h-12 flex-1 font-bold md:h-11">
                {props.finishing ? "Finishing..." : "Finish workout"}
            </Button>
        </div>
    )
}
