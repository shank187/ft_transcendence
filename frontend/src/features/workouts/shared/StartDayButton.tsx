import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Button from "../../../components/ui/Button"
import { ActiveWorkoutError, startWorkoutFromDay } from "./start-workout"
import ActiveWorkoutDialog from "./ActiveWorkoutDialog"

export default function StartDayButton(props: { dayId: string, className?: string })
{
    const [startState, setStartState] = useState(false)
    const [startError, setStartError] = useState<string | null>(null)
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null)
    const navigate = useNavigate()

    return (
        <div className={`flex flex-col gap-1 ${props.className ?? ""}`}>
            <Button
                variant="primary"
                className="min-h-11"
                disabled={startState}
                onClick={async () => {
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
                }}
            >
                {(!startError && !startState) && "▶ Start"}
                {(!startError && startState) && "▶ Starting..."}
                {(startError) && "Retry"}
            </Button>
            {startError && <p className="text-app-danger">{startError}</p>}
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
