import { useCallback, useEffect, useState } from "react"
import type { DayDetail, DraftExercise, SetType } from "./day-editor.types"
import getWorkoutDay, { saveWorkoutDay } from "./day-editor.api"
import ErrorState from "../../components/states/ErrorState"
import NotFoundState from "../../components/states/NotFoundState"
import Button from "../../components/ui/Button"
import LoadingState from "../../components/states/LoadingState"
import EmptyState from "../../components/states/EmptyState"
import emptyStateIcon from "../../assets/empty-icon.png"
import { addDraftSet, appendExercises, isDraftValid, moveExercise, removeDraftSet, removeExercise, toDraft, toSaveBody, updateRest, updateSetField, updateSetType } from "./day-editor.draft"
import type { FieldKey } from "./exercise-fields"
import WorkoutExerciseCard from "./WorkoutExerciseCard"
import { Link, useNavigate } from "react-router-dom"
import Dialog from "../../components/ui/Dialog"
import { buttonClasses } from "../../components/ui/button-classes"
import { ExercisePicker } from "../exercises/ExercisePicker"
import type { Exercise } from "../exercises/exercise.types"

export default function DayEditorView(props:{planId: string, dayId: string})
{
    // day plan details states
    const [day, setDay] = useState<DayDetail| null>(null)
    const [dayError, setDayError] = useState<string|null>(null)
    const [dayLoading, setDayLoading] = useState(true)

    // draft states
    const [draft, setDraft] = useState<DraftExercise[]>([])

    // save states
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string|null>(null)
    
    //leaving dialog
    const [isDialogOpen, setIsDialogOpen] = useState(false)

    // key of the set whose menu is open, so only one menu opens at a time
    const [openSetMenu, setOpenSetMenu] = useState<string|null>(null)

    const [openExecisePicker, setopenExecisePicker] = useState(false)

    const navigate = useNavigate()

    const moveExerciseCard = (key: DraftExercise["key"], direction: 1 | -1)=>{
        setDraft(prev => moveExercise(prev, key, direction))
    }
    const removeExerciseCard = (key: DraftExercise["key"])=>{
        setDraft(prev => removeExercise(prev, key))
    }
    
    const addSelectedExercises = (selected: Exercise[])=>{
        setDraft(prev => appendExercises(prev, selected))
        closeExercisePickerDialog()
    }

    const addSet = (key: string)=>{
        setDraft(prev => addDraftSet(prev, key))
    }

    const removeSet = (exKey: string, setKey: string) =>{
        setDraft(prev => removeDraftSet(prev, exKey, setKey))
    }

    const changeSetField = (exKey: string, setKey: string, field: FieldKey, value: string) =>{
        setDraft(prev => updateSetField(prev, exKey, setKey, field, value))
    }

    const changeSetType = (exKey: string, setKey: string, setType: SetType) =>{
        setDraft(prev => updateSetType(prev, exKey, setKey, setType))
    }

    const changeRest = (exKey: string, value :string) =>{
        setDraft(prev => updateRest(prev, exKey, value))
    }

    const planPath = `/workouts/plans/${props.planId}`

    const saveDay = async () : Promise<boolean>=>{
        setSaveError(null)
        setSaving(true)
        try{
            const result = await saveWorkoutDay(props.planId, props.dayId, toSaveBody(draft))
            setDay(result)
            setDraft(toDraft(result.exercises))
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
        setDraft(toDraft(day.exercises))
    }

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
        return (<ErrorState action={<Button onClick={()=> void loadDayPlan() } variant="secondary" className="min-h-11">Retry</Button>} message={dayError}/>)
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
                    {draft.length !== 0 && <Button variant="secondary" onClick={()=>setopenExecisePicker(true)}>Add Exercises</Button>}
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
                        <Button className="min-h-11" onClick={()=> setopenExecisePicker(true)}>Add Exercises</Button>
                    }
                    />
            }
            {draft.length > 0 &&
                <fieldset disabled={saving} className="min-w-0">
                    <ol className="flex flex-col gap-3">
                        {draft.map((exercise, i)=>(
                            <li key={exercise.key}>
                                <WorkoutExerciseCard
                                onAddSet={addSet}
                                onRemoveSet={removeSet}
                                onChangeRest={changeRest}
                                onFieldChange={changeSetField}
                                onSetTypeChange={changeSetType}
                                openSetMenu={openSetMenu}
                                setOpenSetMenu={setOpenSetMenu}
                                exercise={exercise}
                                onRemove={removeExerciseCard}
                                onMove={moveExerciseCard}
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
                <Dialog isWorking={saving} title={`Save changes to ${day.name}?`} open={true} onClose={closeLeaveDialog}>
                    <p className="text-sm text-app-text-secondary">You have unsaved changes.</p>
                    <div className="flex gap-2 justify-end">
                        <Button className="min-h-11"   disabled={saving || !isValid} onClick={() => void saveAndLeave()} >{saving ?"Saving":"Save"}</Button>
                        <Button variant="ghost" disabled={saving} className="min-h-11 border border-app-border" onClick={closeLeaveDialog}>Keep editing</Button>
                        <Button disabled={saving} className={buttonClasses("secondary", "min-h-11 border border-app-danger")} onClick={()=>navigate(planPath)} >Leave Anyway</Button>
                    </div>
                </Dialog>
            }
            {
                openExecisePicker &&
                <Dialog isWorking={saving} variant="drawer"
                title="Add exercise"
                open={true}
                onClose={closeExercisePickerDialog}
                showClose={true}
                >
                    <ExercisePicker onAdd={addSelectedExercises} />
                </Dialog>
            }
        </div>
    )
}