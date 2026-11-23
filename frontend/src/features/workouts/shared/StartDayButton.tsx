import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Play } from "lucide-react"
import Button from "../../../components/ui/Button"
import { ActiveWorkoutError, startWorkoutFromDay } from "./start-workout"
import ActiveWorkoutDialog from "./ActiveWorkoutDialog"

interface StartDayButtonProps {
    dayId: string
    className?: string
}

export default function StartDayButton(props: StartDayButtonProps)
{
    const [startState, setStartState] = useState(false)
    const [startError, setStartError] = useState<string | null>(null)
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
    const navigate = useNavigate()

    const label = startError ? "Retry" : startState ? "Starting..." : "Start"

    const start = async () => {
        setStartState(true)
        setStartError(null)
        try {
            const session = await startWorkoutFromDay(props.dayId)
            navigate(`/workouts/session/${session.id}`)
        } catch (err) {
            if (err instanceof ActiveWorkoutError)
                setActiveSessionId(err.activeSessionId)
            else
                setStartError(err instanceof Error ? err.message : "Cant start your session.")
        } finally {
            setStartState(false)
        }
    }

    return (
        <div className={`flex flex-col gap-1 ${props.className ?? ""}`}>
            <Button variant="primary" className="min-h-11 gap-1.5 font-bold" disabled={startState} onClick={() => void start()}>
                {!startError && <Play aria-hidden="true" className="size-3.5" fill="currentColor" strokeWidth={0} />}
                {label}
            </Button>
            {startError && <p role="alert" className="text-xs text-app-danger">{startError}</p>}
            {activeSessionId &&
                <ActiveWorkoutDialog
                    activeSessionId={activeSessionId}
                    startNew={() => startWorkoutFromDay(props.dayId)}
                    onClose={() => setActiveSessionId(null)}
                />
            }
        </div>
    )
}
