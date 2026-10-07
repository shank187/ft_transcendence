import React, { use, useCallback, useEffect, useState} from "react"
import type {PlanDetail} from "./plan-detail.types"
import getPlanDetails, { createWorkoutDay, deleteWorkoutDay, renameWorkoutDay } from "./plan-detail.api"
import LoadingState from "../../components/states/LoadingState"
import ErrorState from "../../components/states/ErrorState"
import Button from "../../components/ui/Button"
import PlanHeader from "./PlanHeader"
import DayRow from "./DayRow"
import Form_input from "../../components/ui/Form_input"
import Dialog from "../../components/ui/Dialog"

export default function PlanDetailView(props: {planId: string})
{
    // plan details page
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string|null>(null)
    const [plan, setPlan] = useState<PlanDetail|null>(null)

    //form for creating a day
    const [addDayForm, setAddDayVisibility] = useState(false)
    const [dayname, setDayName] = useState("")
    const [nameError, setErrorForm] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    // menu for renaming/deleting a day
    const [dayMenu, setDayMenu] = useState<string | null>(null)
    
    //rename day
    const [renamingDayId, setRenamingDayId] = useState<string | null>(null)
    const [renameName, setRenameName] = useState("")
    const [renameError, setRenameError] = useState<string | null>(null)

    //delete day 
    const[deletingDayId, setdeletingDayId] = useState<string|null>(null)
    const [deleteDayError, setDeleteDayError] = useState<string|null>(null)

    const closeRename = () => {
        setRenamingDayId(null)
        setRenameError(null)
    }
    const closeDayDelete = () =>{
        setdeletingDayId(null)
        setDeleteDayError(null)
    }

// (3) Save
    const submitRename = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (submitting || !renamingDayId) return
        const name = renameName.trim()
        if (name.length === 0 || name.length > 30) { setRenameError("Invalid name"); return }
        setSubmitting(true)
        try {
            await renameWorkoutDay(props.planId, renamingDayId, name)
            setPlan(previous => previous
                ? { ...previous, days: previous.days.map(d => d.id === renamingDayId ? { ...d, name } : d) }
                : previous)
            closeRename()
        } catch (err) {
            setRenameError(err instanceof Error ? err.message : "could not rename day.")
        } finally {
            setSubmitting(false)
        }
    }
    const deleteDay = async ()=>{
        if(! deletingDayId) return
        try{
            await deleteWorkoutDay(props.planId, deletingDayId);
        }catch(err){
            setDeleteDayError(err instanceof Error ? err.message : "Cant delete this day")
            //TODO-NEXT: work on deleting the day and re rendering
        }finally{
            closeDayDelete()
        }
    }
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
                        <li key={day.id}>
                            <DayRow
                            day={day}
                            dropDownMenu={dayMenu}
                            setDropDown={setDayMenu}
                            onRename={selectedDay => {
                                setDayMenu(null)
                                setRenamingDayId(selectedDay.id)
                                setRenameName(selectedDay.name)
                            }}
                            onDelete={selectedDay => {
                                setDayMenu(null)
                                setdeletingDayId(selectedDay.id)
                            }}
                            />
                        </li>
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
            {
                deleteDayError && <p className="text-app-danger">{deleteDayError}</p>
            }
            {plan.days.length < 7 && !addDayForm &&     
                <Button 
                    onClick={()=>setAddDayVisibility(true)}
                    variant="primary"
                >
                    Add day
                </Button>
            }
            {plan.days.length >= 7 && (<p>A plan can contain at most 7 days.</p>)}
            <Dialog open={renamingDayId !== null} title="Rename the day" onClose={closeRename}>
                <form onSubmit={submitRename} noValidate>
                    <Form_input id="rename-day" label="Day name" type="text"
                                value={renameName} onChange={setRenameName} />
                    {renameError && <p className="text-app-danger">{renameError}</p>}
                    <Button type="button" variant="secondary" onClick={closeRename}>Cancel</Button>
                    <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
                </form>
            </Dialog>
            <Dialog open={deletingDayId !== null} title="Confirm Deletion" onClose={closeDayDelete}>
                <Button variant="danger" onClick={deleteDay} >Confirm</Button>
                <Button variant="secondary" onClick={closeDayDelete}>Cancel</Button>
            </Dialog>
        </div>
    )
} 