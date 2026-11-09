import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { discardWorkout } from "./workout-session.api";
import type { WorkoutSession } from "./workout-session.types";

export default function ActiveWorkoutDialog(props:{
    activeSessionId: string,
    startNew: () => Promise<WorkoutSession>,
    onClose: () => void,
})
{
    const [working, setWorking] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()

    const discardAndStart = async () => {
        setWorking(true)
        setError(null)
        try {
            await discardWorkout(props.activeSessionId)
            const session = await props.startNew()
            navigate(`/workouts/session/${session.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Can't start a new workout, try again.")
        } finally {
            setWorking(false)
        }
    }

    return(
        <Dialog
        title="You have a workout in progress."
        showClose
        isWorking={working}
        onClose={props.onClose}
        >
            <p>Resume it, or discard it and start a new one.</p>
            {error && <p role="alert" className="text-app-danger">{error}</p>}
            <div className="flex flex-col gap-3">
                <Button disabled={working} onClick={() => navigate(`/workouts/session/${props.activeSessionId}`)}>
                    Resume
                </Button>
                <Button variant="danger" disabled={working} onClick={() => void discardAndStart()}>
                    {working ? "Starting..." : "Discard and start new"}
                </Button>
            </div>
        </Dialog>
    )
}
