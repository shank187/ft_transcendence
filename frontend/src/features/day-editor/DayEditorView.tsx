import { useCallback, useEffect, useState } from "react"
import type { DayDetail } from "./day-editor.types"
import getWorkoutDay from "./day-editor.api"
import ErrorState from "../../components/states/ErrorState"
import { Link } from "react-router-dom"
import NotFoundState from "../../components/states/NotFoundState"
import Button from "../../components/ui/Button"
import LoadingState from "../../components/states/LoadingState"
import EmptyState from "../../components/states/EmptyState"
import emptyStateIcon from "../../assets/empty-icon.png"

export default function DayEditorView(props:{planId: string, dayId: string})
{
    const [dayDetail, setDayDetail] = useState<DayDetail| null>(null)
    const [dayError, setDayError] = useState<string|null>(null)
    const [dayLoading, setDayLoading] = useState(true)

    const loadDayPlan = useCallback (async ()=>{
        setDayError(null)
        setDayLoading(true)
        try{
            setDayDetail(await getWorkoutDay(props.planId, props.dayId))
        }catch(err){
            setDayError(err instanceof Error ? err.message: "Failed to Load the workout's day.")
        }finally{
            setDayLoading(false)
        }
    },[props.planId, props.dayId])

    useEffect(() =>{
        loadDayPlan()
    },[loadDayPlan])

    if(dayLoading) return <LoadingState message="Loading Workout day..."/>
    if(dayError)
        return (<ErrorState action={<Button onClick={()=> void loadDayPlan() } variant="secondary">Retry</Button>} message={dayError}/>)
    if(!dayDetail) return(<NotFoundState title="Workout day not Found."></NotFoundState>)


    return(
        <div>
            <header className="flex flex-col gap-5">
                <Link to={`/workouts/plans/${dayDetail.planId}`} className="self-start text-sm text-app-text-secondary hover:text-app-text" > <span>‹ </span>
                    {dayDetail.planName}
                </Link>
                <h1 className="break-words text-[28px] font-semibold">{dayDetail.name}</h1>
            </header>
            {dayDetail.exercises.length === 0 &&
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