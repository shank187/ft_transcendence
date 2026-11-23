import { useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import Dialog from "../../../components/ui/Dialog";
import Button from "../../../components/ui/Button";
import type { WorkoutSessionExercise } from "../shared/workouts.types";
import { EXERCISE_FIELDS, setLabel } from "../shared/exercise-fields";
import { MAX_SETS_PER_EXERCISE } from "../shared/limits";
import ExerciseCardHeader from "../shared/ExerciseCardHeader";
import SetColumnsHeader from "../shared/SetColumnsHeader";
import SetRowSession from "./SetRowSession";
import { useWorkoutSession } from "./WorkoutSessionContext";

interface ExerciseSessionCardProps {
    exercise: WorkoutSessionExercise
    position: number
    isFirst: boolean
    isLast: boolean
    // The workout's first unticked set, or null.
    nextSetId: string | null
}

const iconButtonClasses = "flex size-11 items-center justify-center bg-app-surface-raised disabled:cursor-not-allowed disabled:text-app-text-muted/50"

export default function ExerciseSessionCard(props: ExerciseSessionCardProps)
{
    const { isReadOnly, moveExercise, moving, addSet, addingSet, removeExercise, removing } = useWorkoutSession()
    const [confirmingRemove, setConfirmingRemove] = useState(false)

    const { exercise } = props
    const fields = EXERCISE_FIELDS[exercise.exerciseSummary.type]
    const name = exercise.exerciseSummary.name
    // One move or remove and one add-set at a time for the whole workout,
    // so a move never answers with the id of an exercise being removed.
    const isMoving = moving.busyId !== null || removing.busyId !== null
    const isAddingSet = addingSet.busyId !== null
    const moveError = moving.error?.id === exercise.id ? moving.error.message : null
    const addSetError = addingSet.error?.id === exercise.id ? addingSet.error.message : null
    const removeError = removing.error?.id === exercise.id ? removing.error.message : null
    const loggedCount = exercise.sets.filter(set => set.completedAt !== null).length

    // Asks first only when logged sets would be lost.
    function requestRemove()
    {
        if (loggedCount > 0)
            setConfirmingRemove(true)
        else
            removeExercise(exercise.id)
    }

    function confirmRemove()
    {
        setConfirmingRemove(false)
        removeExercise(exercise.id)
    }

    // Not Card: its rounded-xl and p-4 would clash with this card's own radius and padding.
    return(
        <article className="flex flex-col gap-2 rounded-2xl border border-app-border bg-app-surface p-3.5">
            <ExerciseCardHeader
            position={props.position}
            exercise={exercise.exerciseSummary}
            progress={`${loggedCount} / ${exercise.sets.length} sets`}
            aside={!isReadOnly &&
                <div className="flex shrink-0 gap-2">
                    <div role="group" aria-label={`Reorder ${name}`} className="flex overflow-hidden rounded-lg border border-app-border">
                        <button type="button" aria-label={`Move ${name} up`} disabled={isMoving || props.isFirst} onClick={() => moveExercise(exercise.id, -1)} className={iconButtonClasses}>
                            <ArrowUp aria-hidden="true" className="size-4.5" />
                        </button>
                        <button type="button" aria-label={`Move ${name} down`} disabled={isMoving || props.isLast} onClick={() => moveExercise(exercise.id, 1)} className={`${iconButtonClasses} border-l border-app-border`}>
                            <ArrowDown aria-hidden="true" className="size-4.5" />
                        </button>
                    </div>
                    <button type="button" aria-label={`Remove ${name}`} title="Remove exercise" disabled={isMoving} onClick={requestRemove} className={`${iconButtonClasses} rounded-lg border border-app-border text-app-text-secondary hover:border-app-danger hover:text-app-danger`}>
                        <Trash2 aria-hidden="true" className="size-4.5" />
                    </button>
                </div>
            }
            />
            {moveError && <p role="alert" className="text-sm text-app-danger">{moveError}</p>}
            {removeError && <p role="alert" className="text-sm text-app-danger">{removeError}</p>}

            <SetColumnsHeader fields={fields} withDone />
            <ol className="flex flex-col gap-1">
                {exercise.sets.map((set, i)=>
                    <SetRowSession
                    key={set.id}
                    exerciseId={exercise.id}
                    set={set}
                    position={i + 1}
                    label={setLabel(exercise.sets, i)}
                    fields={fields}
                    isNext={set.id === props.nextSetId}
                    />
                )}
            </ol>
            {!isReadOnly && addSetError && <p role="alert" className="text-sm text-app-danger">{addSetError}</p>}
            {!isReadOnly && exercise.sets.length < MAX_SETS_PER_EXERCISE &&
                <button type="button" disabled={isAddingSet} onClick={() => addSet(exercise.id)} className="-ml-1 flex h-11 items-center gap-1.5 self-start rounded-lg px-3 text-sm font-semibold text-app-primary hover:bg-app-surface-hover disabled:cursor-not-allowed disabled:opacity-50">
                    <Plus aria-hidden="true" className="size-4" />
                    Add set
                </button>
            }
            {!isReadOnly && exercise.sets.length >= MAX_SETS_PER_EXERCISE && <p className="text-sm text-app-text-secondary">{`An exercise can have at most ${MAX_SETS_PER_EXERCISE} sets.`}</p>}
            {confirmingRemove &&
                <Dialog title={`Remove ${name}?`} isWorking={false} showClose onClose={() => setConfirmingRemove(false)}>
                    <p className="mt-2 text-sm text-app-text-secondary">{`Its ${loggedCount} logged ${loggedCount === 1 ? "set" : "sets"} will be deleted.`}</p>
                    <div className="mt-4 flex gap-2">
                        <Button variant="danger" className="flex-1" onClick={confirmRemove}>Remove exercise</Button>
                        <Button variant="secondary" className="flex-1" onClick={() => setConfirmingRemove(false)}>Keep it</Button>
                    </div>
                </Dialog>
            }
        </article>
    )
}
