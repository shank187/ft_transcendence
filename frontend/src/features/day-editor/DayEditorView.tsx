import { useCallback, useEffect, useState } from "react"
import type { DayDetail, DraftExercise } from "./day-editor.types"
import getWorkoutDay from "./day-editor.api"
import ErrorState from "../../components/states/ErrorState"
import { Link } from "react-router-dom"
import NotFoundState from "../../components/states/NotFoundState"
import Button from "../../components/ui/Button"
import LoadingState from "../../components/states/LoadingState"
import EmptyState from "../../components/states/EmptyState"
import emptyStateIcon from "../../assets/empty-icon.png"
import { toDraft } from "./day-editor.draft"

export default function DayEditorView(props:{planId: string, dayId: string})
{
    // day plan details states
    const [day, setDay] = useState<DayDetail| null>(null)
    const [dayError, setDayError] = useState<string|null>(null)
    const [dayLoading, setDayLoading] = useState(true)

    // draft states
    const [draft, setDraft] = useState<DraftExercise[]>([])
    
    
    const loadDayPlan = useCallback (async ()=>{
        setDayError(null)
        setDayLoading(true)
        try{
            const result = await getWorkoutDay(props.planId, props.dayId)
            setDay(result)
            setDraft(result ? toDraft(result.exercises) : [])
        }catch(err){
            setDayError(err instanceof Error ? err.message: "Failed to Load the workout's day.")
        }finally{
            setDayLoading(false)
        }
    },[props.planId, props.dayId,])

    useEffect(() =>{
        loadDayPlan()
    },[loadDayPlan])

    if(dayLoading) return <LoadingState message="Loading Workout day..."/>
    if(dayError)
        return (<ErrorState action={<Button onClick={()=> void loadDayPlan() } variant="secondary">Retry</Button>} message={dayError}/>)
    if(!day) return(<NotFoundState title="Workout day not Found."></NotFoundState>)


    return(
        <div>
            <header className="flex flex-col gap-5">
                <Link to={`/workouts/plans/${day.planId}`} className="self-start text-sm text-app-text-secondary hover:text-app-text" > <span>‹ </span>
                    {day.planName}
                </Link>
                <h1 className="wrap-break-word text-[28px] font-semibold">{day.name}</h1>
            </header>
            {draft.length === 0 &&
                    <EmptyState
                    title="No exercises to show."
                    icon={
                        <img
                        src={emptyStateIcon}
                        alt=""
                        className="w-32"
                        />
                    }
                    action={
                        // TODO(UI 4/7): open the exercise picker
                        <Button disabled>Add Exercises</Button>
                    }
                    />
            }
                
        </div>
    )
}