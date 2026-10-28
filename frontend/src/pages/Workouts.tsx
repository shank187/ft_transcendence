import { useNavigate } from "react-router-dom"
import Button from "../components/ui/Button"
import WorkoutPlanCatalog from "../features/workouts/WorkoutPlanCatalog"
import { startEmptyWorkout } from "../features/workout-session/workout-session.api"
import  { useState } from "react"

function Workouts()
{
    const navigate = useNavigate()
    const [startingEmptyState, setStartingEmptyState] = useState<boolean>(false)
    const [emptySessionError, setEmptySessionError] = useState<string|null>(null)


    const createEmptySessionUrl = async (): Promise<string | undefined> =>{
        setEmptySessionError(null)
        setStartingEmptyState(true)
        try{
            const emptySession = await startEmptyWorkout()
            return `/workouts/session/${emptySession.id}`
        }catch (err){
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
            <WorkoutPlanCatalog/>
        </div>
    )
}

export default Workouts