import { useEffect, useState } from "react";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";

// 38:42 under an hour, 1:02:05 after.
function formatElapsed(ms: number): string
{
    const totalSeconds = Math.max(0, Math.floor(ms / 1000))
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor(totalSeconds / 60) % 60
    const seconds = String(totalSeconds % 60).padStart(2, "0")
    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${seconds}`
        : `${minutes}:${seconds}`
}

export default function SessionHeader(props:{
    name: string
    startedAt: string
    doneCount: number
    totalCount: number
    status: string
    isReadOnly: boolean
    onDiscard: ()=>void
    onFinish: ()=>void
    finishing : boolean
    finishedAt: string | null
})
{
    const [now, setNow] = useState(() => Date.now())

    // Re-render once a second so the elapsed time moves; the interval stops when the page closes.
    useEffect(() => {
        if(!props.isReadOnly)
        {
            const timer = setInterval(() => setNow(Date.now()), 1000)
            return () => clearInterval(timer)
        }
    }, [props.isReadOnly])

    let elapsed = null;
    if(! props.isReadOnly)
        elapsed= formatElapsed(now - new Date(props.startedAt).getTime())
    else if(props.finishedAt)
        elapsed= formatElapsed(new Date(props.finishedAt).getTime() - new Date(props.startedAt).getTime())

    return(
        <header className="sticky top-4 z-10">
            <Card className="flex items-center justify-between gap-4 border border-app-border px-5 py-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <h1 className="truncate text-xl font-semibold">{props.name}</h1>
                    <p className="text-xs text-app-text-muted">
                        {elapsed && <time>{elapsed}</time>} · {props.doneCount} / {props.totalCount} sets
                    </p>
                </div>
                {! props.isReadOnly &&
                    <div className="flex gap-3">
                        <Button className="flex-1" disabled={props.doneCount === 0 || props.finishing} onClick={()=> props.onFinish()}>Finish</Button>
                        <Button className="flex-1" disabled={props.finishing} variant="danger" onClick={()=> props.onDiscard()}>Discard</Button>
                    </div>
                }
                {props.isReadOnly &&
                    <p>{props.status}</p>
                }
            </Card>
        </header>
    )
}
