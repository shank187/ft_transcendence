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
    onDiscard: ()=>void
})
{
    const [now, setNow] = useState(() => Date.now())

    // Re-render once a second so the elapsed time moves; the interval stops when the page closes.
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 1000)
        return () => clearInterval(timer)
    }, [])

    const elapsed = formatElapsed(now - new Date(props.startedAt).getTime())

    return(
        <header className="sticky top-4 z-10">
            <Card className="flex items-center justify-between gap-4 border border-app-border px-5 py-4">
                <div className="flex min-w-0 flex-col gap-0.5">
                    <h1 className="truncate text-xl font-semibold">{props.name}</h1>
                    <p className="text-xs text-app-text-muted">
                        <time>{elapsed}</time> · {props.doneCount} / {props.totalCount} sets
                    </p>
                </div>
                <Button variant="danger" onClick={()=> props.onDiscard()}>Discard</Button>
            </Card>
        </header>
    )
}
