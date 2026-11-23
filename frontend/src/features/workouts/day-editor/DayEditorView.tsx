import { useEffect, useReducer, useState } from "react"
import { ChevronLeft, Dumbbell, Plus } from "lucide-react"
import type { DayDetail } from "./day-editor.types"
import getWorkoutDay, { saveWorkoutDay } from "./day-editor.api"
import ErrorState from "../../../components/states/ErrorState"
import NotFoundState from "../../../components/states/NotFoundState"
import Button from "../../../components/ui/Button"
import LoadingState from "../../../components/states/LoadingState"
import { draftReducer, isDraftValid, toDraft, toSaveBody } from "./day-editor.draft"
import { MAX_EXERCISES } from "../shared/limits"
import WorkoutExerciseCard from "./WorkoutExerciseCard"
import { Link, useNavigate } from "react-router-dom"
import Dialog from "../../../components/ui/Dialog"
import { buttonClasses } from "../../../components/ui/button-classes"
import { ExercisePicker } from "../shared/exercise-picker/ExercisePicker"
import type { ExerciseItem } from "../shared/exercise-picker/exercise.types"

// Tailwind's xl: from here the picker is docked beside the cards instead of opening in a drawer.
const DOCK_QUERY = "(min-width: 80rem)"

interface DayEditorViewProps {
    planId: string
    dayId: string
}

export default function DayEditorView(props: DayEditorViewProps)
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
    const [isDocked, setIsDocked] = useState(() => window.matchMedia(DOCK_QUERY).matches)

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

    // A media query in state, not a CSS-hidden copy, so phones don't load the catalog for nothing.
    useEffect(() => {
        const media = window.matchMedia(DOCK_QUERY)
        const update = () => setIsDocked(media.matches)
        media.addEventListener("change", update)
        return () => media.removeEventListener("change", update)
    }, [])

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
    const canAddExercise = draft.length < MAX_EXERCISES
    const exerciseCount = `${draft.length} ${draft.length === 1 ? "exercise" : "exercises"}`
    const openPicker = () => setopenExecisePicker(true)
    const addedIds = draft.map(exercise => exercise.exerciseSummary.id)

    return(
        <div className="flex w-full gap-6">
            <div className="flex w-full min-w-0 max-w-[640px] flex-col gap-4">
                <header className="flex flex-col gap-1">
                    <Link onClick={handleBackClick} to={planPath} className="-ml-1.5 flex h-11 items-center gap-1 self-start text-sm font-medium text-app-text-secondary hover:text-app-text">
                        <ChevronLeft aria-hidden="true" className="size-5" />
                        {day.planName}
                    </Link>
                    <h1 className="text-[26px] font-bold tracking-tight wrap-break-word">{day.name}</h1>
                    <p className="text-sm text-app-text-secondary">{exerciseCount} · targets copy into the workout when you start</p>
                </header>
                {draft.length === 0 &&
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-app-border bg-app-surface px-6 py-10 text-center">
                        <span className="flex size-16 items-center justify-center rounded-full bg-app-primary/10 text-app-primary">
                            <Dumbbell aria-hidden="true" className="size-7.5" strokeWidth={1.75} />
                        </span>
                        <strong className="text-lg font-semibold">No exercises yet</strong>
                        <p className="max-w-70 text-sm text-app-text-secondary">
                            {isDocked ? "Pick exercises from the catalog on the right." : "Pick the exercises for this day and set the targets you aim for."}
                        </p>
                        {!isDocked &&
                            <Button className="mt-1 min-h-12 gap-2 font-bold" disabled={saving} onClick={openPicker}>
                                <Plus aria-hidden="true" className="size-4.5" strokeWidth={2.5} />
                                Add exercises
                            </Button>
                        }
                    </div>
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
                {draft.length > 0 && canAddExercise && !isDocked &&
                    <button type="button" disabled={saving} onClick={openPicker} className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-dashed border-app-primary text-[15px] font-semibold text-app-primary hover:bg-app-primary/10 disabled:opacity-50">
                        <Plus aria-hidden="true" className="size-4.5" strokeWidth={2.5} />
                        Add exercises
                    </button>
                }
                {!canAddExercise && <p className="text-sm text-app-text-secondary">{`A day can have at most ${MAX_EXERCISES} exercises.`}</p>}
                {/* Sticks above the S1 bottom nav on phones. role=status reads the text when it changes. */}
                {(isDirty || !isValid) &&
                    <div role="status" className="sticky bottom-14 z-20 -mx-4 flex flex-wrap items-center gap-2.5 border-t border-app-border bg-app-surface-raised px-4 py-3 md:bottom-4 md:mx-0 md:rounded-2xl md:border">
                        <span aria-hidden="true" className={`size-2 shrink-0 rounded-full ${isValid && !saveError ? "bg-amber-400" : "bg-app-danger"}`} />
                        {saveError && isValid
                            ? <p className="min-w-0 flex-1 text-sm font-semibold text-app-danger">{saveError}</p>
                            : <p className={`min-w-0 flex-1 text-sm font-semibold ${isValid ? "" : "text-app-danger"}`}>
                                {saving ? "Saving…" : isValid ? "Unsaved changes" : "Fix the fields in red to save"}
                            </p>
                        }
                        <button type="button" disabled={saving} onClick={discardChanges} className="h-11 shrink-0 rounded-lg border border-app-border px-3.5 text-sm font-semibold hover:bg-app-surface-hover disabled:opacity-50">Discard</button>
                        <Button disabled={saving || !isValid} onClick={()=> void saveDay()} className="min-h-11 shrink-0 font-bold">{saving ? "Saving..." : "Save day"}</Button>
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
                {openExecisePicker && !isDocked &&
                    <Dialog
                        isWorking={saving}
                        variant="drawer"
                        title="Add exercise"
                        onClose={closeExercisePickerDialog}
                        showClose={true}
                    >
                        <ExercisePicker onAdd={addSelectedExercises} addedIds={addedIds} addedLabel="In this day" />
                    </Dialog>
                }
            </div>
            {isDocked &&
                <aside aria-labelledby="catalog-title" className="sticky top-8 flex h-[calc(100dvh-4rem)] w-95 shrink-0 flex-col gap-3 rounded-2xl border border-app-border bg-app-surface p-4">
                    <h2 id="catalog-title" className="text-lg font-bold">Exercise catalog</h2>
                    {canAddExercise
                        // fieldset: no add while a save runs, or the save's answer would drop it.
                        ? <fieldset disabled={saving} className="flex min-h-0 min-w-0 flex-1 flex-col">
                            <ExercisePicker onAdd={addSelectedExercises} addedIds={addedIds} addedLabel="In this day" />
                        </fieldset>
                        : <p className="text-sm text-app-text-secondary">{`A day can have at most ${MAX_EXERCISES} exercises.`}</p>
                    }
                </aside>
            }
        </div>
    )
}
