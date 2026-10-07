import React, { useCallback, useEffect, useState} from "react"
import type {PlanDetail} from "./plan-detail.types"
import getPlanDetails, { createWorkoutDay } from "./plan-detail.api"
import LoadingState from "../../components/states/LoadingState"
import ErrorState from "../../components/states/ErrorState"
import Button from "../../components/ui/Button"
import PlanHeader from "./PlanHeader"
import DayRow from "./DayRow"
import Form_input from "../../components/ui/Form_input"

export default function PlanDetailView(props: {planId: string})
{
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string|null>(null)
    const [plan, setPlan] = useState<PlanDetail|null>(null)
   
    //form of addig a day
    const [addDayForm, setAddDayVisibility] = useState(false)
    const [dayname, setDayName] = useState("")
    const [nameError, setErrorForm] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const loadPlan = useCallback( async ()=>{
        setError(null)
        setLoading(true)
        try{
            setPlan(await getPlanDetails(props.planId))
        }catch(err){
            setError(err instanceof(Error) ? err.message : "Failed to load page, try again.")
        }finally{
            setLoading(false)
        }
    }, [props.planId])

    const submitDay =  async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        if(submitting || !plan) return
        const name = dayname.trim()
        setErrorForm(null)
        if( name.length === 0  || name.length  > 30){
            setErrorForm("Invalid name")
            return
        }
        if (plan && plan.days.length >= 7) {
            setErrorForm("A plan can contain at most 7 days.")
            return
        }
        setSubmitting(true)
        try{
            const nextOrder = Math.max(0, ...plan.days.map(day=>day.dayOrder)) + 1
            const createdDay = await createWorkoutDay(props.planId, name, nextOrder);
            setPlan(previous => 
                    previous
                    ? {...previous, days: [...previous.days, createdDay]}
                    :previous
            )
            setAddDayVisibility(false)
            setDayName("")
        }catch(err)
        {
            setErrorForm(err instanceof Error ? err.message : "could not add day.")
        }finally{
            setSubmitting(false)
        }
    }

    useEffect(()=>{
        loadPlan();
    },[loadPlan])

    if(loading) return <LoadingState message="Loading plan detail..."/>
    if(error)
        return(
            <ErrorState
            message={error}
            action={<Button
                    onClick={() => void loadPlan()}
                    >
                Retry
                </Button>}
            />
        )
    if(!plan) return <h1>Plan not found.</h1>
    return(
        <div>
            <PlanHeader
            name={plan.name}
            description={plan.description}
            type={plan.type}
            dayCount={plan.days.length}
            />
            {plan.days.length === 0 ? (
                <p>no Workout day Yet.</p>
            ) : (
                <ol>
                    { [...plan.days]
                    .sort((a, b) => a.dayOrder - b.dayOrder)
                    .map(day => (
                        <li key={day.id}><DayRow day={day} /></li>
                    ))}
                </ol>
            )
            }
            {addDayForm &&
                <form onSubmit={submitDay} noValidate>
                    <Form_input
                        id="day-name"
                        label="Enter a day name."
                        value = {dayname}
                        onChange={setDayName}
                        type="text"
                    />
                    {nameError && (<p className="text-sm text-app-danger">{nameError}</p>)}
                    <Button
                    type="submit"
                    disabled = {submitting}
                    >
                        Save
                    </Button>
                    {!submitting && (<Button variant="secondary"  onClick={()=>setAddDayVisibility(false) }>Cancel</Button>)}
                </form>
            }
            {plan.days.length < 7 && !addDayForm &&     
                <Button 
                    onClick={()=>setAddDayVisibility(true)}
                    variant="secondary"
                >
                    Add day
                </Button>
            }
        </div>
    )
} 