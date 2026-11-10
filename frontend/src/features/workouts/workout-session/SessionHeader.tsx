import { useEffect, useState } from "react";
import Card from "../../../components/ui/Card";
import Button from "../../../components/ui/Button";
import { formatElapsed } from "./workout-session.helpers";
import type { WorkoutSessionStatus } from "../shared/workouts.types";

const STATUS_LABEL: Record<WorkoutSessionStatus, string> = {
    IN_PROGRESS: "In progress",
    COMPLETED: "Finished",
    CANCELLED: "Discarded",
}

export default function SessionHeader(props:{
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
})
{
    const [now, setNow] = useState(() => Date.now())

    // Re-render once a second so the elapsed time moves; the interval stops when the page closes
    // or the workout becomes read-only.
    useEffect(() => {
        if(!props.isReadOnly)
        {
            const timer = setInterval(() => setNow(Date.now()), 1000)
            return () => clearInterval(timer)
        }
    }, [props.isReadOnly])

    const startedMs = new Date(props.startedAt).getTime()

    return(
        <header className="sticky top-4 z-10">
            <Card className="flex items-center justify-between gap-4 border border-app-border px-5 py-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <h1 className="truncate text-xl font-semibold">{props.name}</h1>
                    {!props.isReadOnly &&
                        <p className="text-xs text-app-text-muted">
                            <time>{formatElapsed(now - startedMs)}</time> · {props.doneCount} / {props.totalCount} sets
                        </p>
                    }
                    {props.status === "COMPLETED" && props.finishedAt &&
                        <p className="text-xs text-app-text-muted">
                            <time>{formatElapsed(new Date(props.finishedAt).getTime() - startedMs)}</time>
                        </p>
                    }
                </div>
                {!props.isReadOnly &&
                    <div className="flex gap-3">
                        <Button className="flex-1" disabled={props.doneCount === 0 || props.finishing} onClick={props.onFinish}>
                            {props.finishing ? "Finishing..." : "Finish"}
                        </Button>
                        <Button className="flex-1" disabled={props.finishing} variant="danger" onClick={props.onDiscard}>Discard</Button>
                    </div>
                }
                {props.isReadOnly && <p className="shrink-0 text-sm text-app-text-secondary">{STATUS_LABEL[props.status]}</p>}
            </Card>
        </header>
    )
}
