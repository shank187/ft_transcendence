import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import WorkoutPlanCatalog from "../features/workouts/plans/WorkoutPlanCatalog"
import { ActiveWorkoutError, startEmptyWorkout } from "../features/workouts/shared/start-workout"
import  { useState } from "react"
import ActiveWorkoutDialog from "../features/workouts/shared/ActiveWorkoutDialog"

function Workouts()
{
    const navigate = useNavigate()
    const [startingEmptyState, setStartingEmptyState] = useState<boolean>(false)
    const [emptySessionError, setEmptySessionError] = useState<string|null>(null)
    const [activeSessionId, setActiveSessionId] = useState<string | null>(null)

    const createEmptySessionUrl = async (): Promise<string | undefined> =>{
        setEmptySessionError(null)
        setStartingEmptyState(true)
        try{
            const emptySession = await startEmptyWorkout()
            return `/workouts/session/${emptySession.id}`
        }catch (err){
            if (err instanceof ActiveWorkoutError)
                setActiveSessionId(err.activeSessionId)
            else
                setEmptySessionError(err instanceof Error ? err.message : "cant open the session, start againg")
        }finally{
            setStartingEmptyState(false)
        }
    }
    return (
        <div>
            {! emptySessionError &&
            <Button
            variant="secondary"
            disabled={startingEmptyState}
            onClick={async ()=>{
                const url = await createEmptySessionUrl();
                if(url)
                    navigate(url)
            }}
            >
                {!startingEmptyState ? "Start empty workouts" : "Starting..."}
            </Button>}
            {emptySessionError &&
                <Button
                variant="secondary"
                disabled={startingEmptyState}
                onClick={async ()=>{
                    const url = await createEmptySessionUrl();
                    if(url)
                        navigate(url)
                }}
                >
                    {startingEmptyState? "Starting...": "Retry"}
                </Button>
            }
            {emptySessionError && <p className="text-app-danger">{emptySessionError}</p>}
            {activeSessionId &&
                <ActiveWorkoutDialog
                activeSessionId={activeSessionId}
                startNew={startEmptyWorkout}
                onClose={() => setActiveSessionId(null)}
                />
            }
            <WorkoutPlanCatalog/>
        </div>
    )
}

export default Workouts