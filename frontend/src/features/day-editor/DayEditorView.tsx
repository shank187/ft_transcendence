import { useEffect, useState } from "react"
import type { DayDetail } from "./day-editor.types"
import getWorkoutDay from "./day-editor.api"
import ErrorState from "../../components/states/ErrorState"
import { Link } from "react-router-dom"
import NotFoundState from "../../components/states/NotFoundState"
import Button from "../../components/ui/Button"

export default function DayEditorView(props:{planId: string, dayId: string})
{
    const [dayDetail, setDayDetail] = useState<DayDetail| null>(null)
    const [DayError, setDayError] = useState<string|null>(null)
    const [dayLoading, setDayLoading] = useState(true)

    const loadDayPlan = async ()=>{
        setDayError(null)
        setDayLoading(true)
        try{
            setDayDetail(await getWorkoutDay(props.planId, props.dayId))
        }catch(err){
            setDayError(err instanceof Error ? err.message: "Failed to Load the workout's day.")
        }finally{
            setDayLoading(false)
        }
    }
    useEffect(() =>{
        loadDayPlan()
    },[props.planId, props.dayId])

    if(dayLoading) return <h1>Loading</h1>
    if(DayError)
        return (<ErrorState action={<Button onClick={()=> void loadDayPlan() } variant="secondary">Retry</Button>} message={DayError}/>)
    if(!dayDetail) return(<NotFoundState title="Workout day not Found."></NotFoundState>)


    return(
        <div>
            <header className="flex flex-col gap-5">
                <Link to={`/workouts/plans/${dayDetail.planId}`} className="self-start text-sm text-app-text-secondary hover:text-app-text" > <span>‹ </span>
                    {dayDetail.planName}
                </Link>
                <h1 className="break-words text-[28px] font-semibold">{dayDetail.name}</h1>
            </header>
        </div>
    )
}