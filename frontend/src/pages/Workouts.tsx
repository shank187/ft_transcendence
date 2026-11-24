import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ChevronRight, Plus } from "lucide-react"
import WorkoutPlanCatalog from "../features/workouts/plans/WorkoutPlanCatalog"
import { ActiveWorkoutError, startEmptyWorkout } from "../features/workouts/shared/start-workout"
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

    const startEmpty = async () => {
        const url = await createEmptySessionUrl()
        if(url)
            navigate(url)
    }

    // Same width as the plan page and the workout, so the left edge stays put between S3 pages.
    return (
        <div className="mx-auto flex max-w-[880px] flex-col gap-6 md:gap-7">
            <header className="flex flex-col gap-1">
                <h1 className="text-[28px] font-bold tracking-tight md:text-[32px]">Workouts</h1>
                <p className="text-sm text-app-text-secondary md:text-[15px]">Pick a plan, or start lifting right away.</p>
            </header>

            <div className="flex flex-col gap-2">
                <button
                type="button"
                disabled={startingEmptyState}
                onClick={() => void startEmpty()}
                className="flex items-center gap-3.5 rounded-2xl border border-app-primary bg-app-primary/8 p-4 text-left hover:bg-app-primary/12 disabled:cursor-wait disabled:opacity-70 md:px-6 md:py-5"
                >
                    <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-app-primary text-app-canvas">
                        <Plus aria-hidden="true" className="size-5.5" strokeWidth={2.5} />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                        <strong className="font-semibold">
                            {startingEmptyState ? "Starting..." : emptySessionError ? "Retry empty workout" : "Start empty workout"}
                        </strong>
                        <span className="text-[13px] text-app-text-secondary md:text-sm">Add exercises as you go</span>
                    </span>
                    <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-app-primary" />
                </button>
                {emptySessionError && <p role="alert" className="text-sm text-app-danger">{emptySessionError}</p>}
            </div>

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
