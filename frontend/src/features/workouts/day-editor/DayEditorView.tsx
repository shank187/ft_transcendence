import { useEffect, useReducer, useState } from "react"
import type { DayDetail } from "./day-editor.types"
import getWorkoutDay, { saveWorkoutDay } from "./day-editor.api"
import ErrorState from "../../../components/states/ErrorState"
import NotFoundState from "../../../components/states/NotFoundState"
import Button from "../../../components/ui/Button"
import LoadingState from "../../../components/states/LoadingState"
import EmptyState from "../../../components/states/EmptyState"
import emptyStateIcon from "../../../assets/empty-icon.png"
import { draftReducer, isDraftValid, toDraft, toSaveBody } from "./day-editor.draft"
import { MAX_EXERCISES } from "../shared/limits"
import WorkoutExerciseCard from "./WorkoutExerciseCard"
import { Link, useNavigate } from "react-router-dom"
import Dialog from "../../../components/ui/Dialog"
import { buttonClasses } from "../../../components/ui/button-classes"
import { ExercisePicker } from "../shared/exercise-picker/ExercisePicker"
import type { ExerciseItem } from "../shared/exercise-picker/exercise.types"

export default function DayEditorView(props:{planId: string, dayId: string})
{
    const [day, setDay] = useState<DayDetail| null>(null)
    const [dayError, setDayError] = useState<string|null>(null)
    const [dayLoading, setDayLoading] = useState(true)
    const [reloadCount, setReloadCount] = useState(0)

    const [draft, dispatch] = useReducer(draftReducer, [])

    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string|null>(null)
    
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // key of the set whose menu is open, so only one menu opens at a time
    const [openSetMenu, setOpenSetMenu] = useState<string|null>(null)

    const [openExecisePicker, setopenExecisePicker] = useState(false)

    const navigate = useNavigate()

    const addSelectedExercises = (selected: ExerciseItem[])=>{
        dispatch({ type: "exercisesAdded", selected })
        closeExercisePickerDialog()
    }

    const planPath = `/workouts/plans/${props.planId}`

    const saveDay = async () : Promise<boolean>=>{
        setSaveError(null)
        setSaving(true)
        try{
            const result = await saveWorkoutDay(props.planId, props.dayId, toSaveBody(draft))
            setDay(result)
            dispatch({ type: "reset", exercises: result.exercises })
            setSaving(false)
            return true
        }catch(err){
            setSaveError(err instanceof Error ? err.message: "Failed to save the workout day.")
            setSaving(false)
            return false
        }
    }
    const saveAndLeave = async()=>{
        const ok = await saveDay()
        if (ok)  navigate(planPath)
        else closeLeaveDialog()
    }
    const discardChanges = ()=>{
        if(!day) return
        setSaveError(null)
        dispatch({ type: "reset", exercises: day.exercises })
    }

    const reloadDay = () => {
        setDayError(null)
        setDayLoading(true)
        setReloadCount(count => count + 1)
    }

    // The load lives inside the effect so its cleanup can ignore an answer for an
    // older day or an older reload.
    useEffect(() =>{
        let ignore = false
        const loadDayPlan = async () => {
            try{
                const result = await getWorkoutDay(props.planId, props.dayId)
                if (ignore) return
                setDay(result)
                dispatch({ type: "reset", exercises: result?.exercises ?? [] })
            }catch(err){
                if (ignore) return
                setDayError(err instanceof Error ? err.message: "Failed to Load the workout's day.")
            }finally{
                if (!ignore) setDayLoading(false)
            }
        }
        void loadDayPlan()
        return () => { ignore = true }
    },[props.planId, props.dayId, reloadCount])

    // Compare save bodies, not drafts, so typing a value back by hand counts as clean.
    const isDirty = day ? JSON.stringify(toSaveBody(draft)) !== JSON.stringify(toSaveBody(toDraft(day.exercises))) : false

    const handleBackClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>)=>{
        if(isDirty){
            e.preventDefault()
            setIsDialogOpen(true);
        }
    }

    const closeLeaveDialog = ()=>{
        setIsDialogOpen(false)
    }

    const closeExercisePickerDialog = ()=>{
        setopenExecisePicker(false)
    }

    useEffect(()=>{
        if(!isDirty)
            return
        const handleLeaving = (event: BeforeUnloadEvent)=>{
            event.preventDefault()
        }
        window.addEventListener("beforeunload", handleLeaving)
        return ()=> window.removeEventListener("beforeunload", handleLeaving)
    }, [isDirty])

    if(dayLoading) return <LoadingState message="Loading Workout day..."/>
    if(dayError)
        return (<ErrorState action={<Button onClick={reloadDay} variant="secondary" className="min-h-11">Retry</Button>} message={dayError}/>)
    if(!day)
        return(
            <NotFoundState
            title="Workout day not found."
            description="It may have been deleted."
            action={<Link
                    to={planPath}
                    className={buttonClasses("secondary", "mt-4 min-h-11")}
                    >
                Back to the plan
                </Link>}
            />
        )

    const isValid = isDraftValid(draft)


    return(
        <div className="flex w-full max-w-[640px] flex-col gap-4">
            <header className="flex flex-col gap-2">
                <Link  onClick={handleBackClick} to={planPath} className="inline-flex min-h-11 items-center self-start text-sm text-app-text-secondary hover:text-app-text">‹ {day.planName}</Link>
                <div className="flex justify-between">
                    <h1 className="text-[28px] font-semibold">{day.name}</h1>
                    {draft.length !== 0 && draft.length < MAX_EXERCISES && <Button variant="secondary" disabled={saving} onClick={()=>setopenExecisePicker(true)}>Add Exercises</Button>}
                    {draft.length >= MAX_EXERCISES && <p className="text-sm text-app-text-secondary">{`A day can have at most ${MAX_EXERCISES} exercises.`}</p>}
                </div>
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
                        <Button className="min-h-11" disabled={saving} onClick={()=> setopenExecisePicker(true)}>Add Exercises</Button>
                    }
                    />
            }
            {draft.length > 0 &&
                <fieldset disabled={saving} className="min-w-0">
                    <ol className="flex flex-col gap-3">
                        {draft.map((exercise, i)=>(
                            <li key={exercise.key}>
                                <WorkoutExerciseCard
                                exercise={exercise}
                                dispatch={dispatch}
                                openSetMenu={openSetMenu}
                                setOpenSetMenu={setOpenSetMenu}
                                position={i+1}
                                isFirst={i === 0}
                                isLast= {i === draft.length - 1}
                                />
                            </li>
                            ))
                        }
                    </ol>
                </fieldset>

            }
            {(isDirty || !isValid) &&
                <div className="sticky bottom-16 flex items-center gap-3 rounded-lg border border-app-border bg-app-surface-raised px-4 py-3 md:bottom-4">
                    {saveError && isValid
                        ? <p role="alert" className="min-w-0 flex-1 text-sm font-medium text-app-danger">{saveError}</p>
                        : <p className={`min-w-0 flex-1 text-sm font-medium ${isValid ? "text-app-text-secondary" : "text-app-danger"}`}>
                            {saving ? "Saving…" : isValid ? "Unsaved changes" : "Fix the fields in red to save"}
                        </p>
                    }
                    <Button variant="ghost" disabled={saving} onClick={discardChanges} className="min-h-11 shrink-0">Discard</Button>
                    <Button disabled={saving || !isValid} onClick={()=> void saveDay()} className="min-h-11 shrink-0">{saving ? "Saving..." : "Save"}</Button>
                </div>
            }
            {isDialogOpen &&
                <Dialog isWorking={saving} title={`Save changes to ${day.name}?`} onClose={closeLeaveDialog}>
                    <p className="text-sm text-app-text-secondary">You have unsaved changes.</p>
                    <div className="flex gap-2 justify-end">
                        <Button className="min-h-11"   disabled={saving || !isValid} onClick={() => void saveAndLeave()} >{saving ?"Saving":"Save"}</Button>
                        <Button variant="ghost" disabled={saving} className="min-h-11 border border-app-border" onClick={closeLeaveDialog}>Keep editing</Button>
                        <Button disabled={saving} className={buttonClasses("secondary", "min-h-11 border border-app-danger")} onClick={()=>navigate(planPath)} >Leave Anyway</Button>
                    </div>
                </Dialog>
            }
            {openExecisePicker &&
                <Dialog
                    isWorking={saving}
                    variant="drawer"
                    title="Add exercise"
                    onClose={closeExercisePickerDialog}
                    showClose={true}
                >
                    <ExercisePicker onAdd={addSelectedExercises} />
                </Dialog>
            }
        </div>
    )
}
