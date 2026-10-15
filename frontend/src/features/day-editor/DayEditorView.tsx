import { useCallback, useEffect, useState } from "react"
import type { DayDetail, DraftExercise } from "./day-editor.types"
import getWorkoutDay, { saveWorkoutDay } from "./day-editor.api"
import ErrorState from "../../components/states/ErrorState"
import NotFoundState from "../../components/states/NotFoundState"
import Button from "../../components/ui/Button"
import LoadingState from "../../components/states/LoadingState"
import EmptyState from "../../components/states/EmptyState"
import emptyStateIcon from "../../assets/empty-icon.png"
import { addDraftSet, isDraftValid, moveExercise, removeDraftSet, removeExercise, toDraft, toSaveBody, updateRest, updateSetField } from "./day-editor.draft"
import type { FieldKey } from "./exercise-fields"
import WorkoutExerciseCard from "./WorkoutExerciseCard"
import { Link } from "react-router-dom"
import Dialog from "../../components/ui/Dialog"
import { buttonClasses } from "../../components/ui/button-classes"

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

    const moveExerciseCard = (key: DraftExercise["key"], direction: 1 | -1)=>{
        setDraft(prev => moveExercise(prev, key, direction))
    }
    const removeExerciseCard = (key: DraftExercise["key"])=>{
        setDraft(prev => removeExercise(prev, key))
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

    const changeRest = (exKey: string, value :string) =>{
        setDraft(prev => updateRest(prev, exKey, value))
    }

    const saveDay = async ()=>{
        setSaveError(null)
        setSaving(true)
        try{
            const result = await saveWorkoutDay(props.planId, props.dayId, toSaveBody(draft))
            setDay(result)
            setDraft(toDraft(result.exercises))
        }catch(err){
            setSaveError(err instanceof Error ? err.message: "Failed to save the workout day.")
        }finally{
            setSaving(false)
        }
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
    if(!day) return(<NotFoundState title="Workout day not Found."></NotFoundState>)

    const planPath = `/workouts/plans/${day.planId}`
    const isValid = isDraftValid(draft)


    return(
        <div className="flex w-full max-w-[640px] flex-col gap-4">
            <header className="flex flex-col gap-2">
                <Link  onClick={handleBackClick} to={planPath} className="inline-flex min-h-11 items-center self-start text-sm text-app-text-secondary hover:text-app-text">‹ {day.planName}</Link>
                <h1 className="text-[28px] font-semibold">{day.name}</h1>
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
                        <Button disabled className="min-h-11">Add Exercises</Button>
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
                <Dialog isWorking={false} title="Leave without saving?" open={true} onClose={closeLeaveDialog}>
                    <p>Your changes to this day will be lost.</p>
                    <div className="flex gap-3">
                        <Link className={buttonClasses("danger",  "border border-app-border flex-1 min-h-11")} to={planPath} >Leave</Link>
                        <Button variant="secondary" className="flex-1 min-h-11" onClick={closeLeaveDialog}>Keep editing</Button>
                    </div>
                </Dialog>
            }
        </div>
    )
}