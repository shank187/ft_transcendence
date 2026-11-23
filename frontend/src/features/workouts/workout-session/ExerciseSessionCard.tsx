import { useState } from "react";
import { Trash2 } from "lucide-react";
import Card from "../../../components/ui/Card";
import Dialog from "../../../components/ui/Dialog";
import type { WorkoutSessionExercise } from "../shared/workouts.types";
import { EXERCISE_FIELDS, setLabel } from "../shared/exercise-fields";
import SetRowSession from "./SetRowSession";
import { MAX_SETS_PER_EXERCISE } from "../shared/limits";
import Button from "../../../components/ui/Button";
import ExerciseCardHeader from "../shared/ExerciseCardHeader";
import SetColumnsHeader from "../shared/SetColumnsHeader";
import { useWorkoutSession } from "./WorkoutSessionContext";

export default function ExerciseSessionCard(props:{
    exercise: WorkoutSessionExercise,
    position: number,
    isFirst: boolean,
    isLast: boolean,
})
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

    return(
        <Card className="p-5">
            <ExerciseCardHeader
            position={props.position}
            exercise={exercise.exerciseSummary}
            aside={!isReadOnly &&
                <div className="flex shrink-0 gap-2">
                    {!props.isFirst &&
                        <Button variant="secondary" disabled={isMoving} aria-label={`Move ${name} up`} onClick={() => moveExercise(exercise.id, -1)} className="size-11">↑</Button>
                    }
                    {!props.isLast &&
                        <Button variant="secondary" disabled={isMoving} aria-label={`Move ${name} down`} onClick={() => moveExercise(exercise.id, 1)} className="size-11">↓</Button>
                    }
                    <Button variant="secondary" disabled={isMoving} aria-label={`Remove ${name}`} onClick={requestRemove} className="size-11">
                        <Trash2 aria-hidden="true" className="size-5" />
                    </Button>
                </div>
            }
            />
            {moveError && <p role="alert" className="text-app-danger">{moveError}</p>}
            {removeError && <p role="alert" className="text-app-danger">{removeError}</p>}

            <SetColumnsHeader fields={fields} />
            <ol className="flex flex-col gap-3">
                {exercise.sets.map((set, i)=>
                    <SetRowSession
                    key={set.id}
                    exerciseId={exercise.id}
                    set={set}
                    position={i + 1}
                    label={setLabel(exercise.sets, i)}
                    fields={fields}
                    />
                )}
            </ol>
            {(!isReadOnly && addSetError) && <p className="text-app-danger">{addSetError}</p>}
            {!isReadOnly && exercise.sets.length < MAX_SETS_PER_EXERCISE && <Button disabled={isAddingSet} onClick={()=> addSet(exercise.id)}>Add set</Button>}
            {!isReadOnly && exercise.sets.length >= MAX_SETS_PER_EXERCISE && <p className="text-sm text-app-text-secondary">{`An exercise can have at most ${MAX_SETS_PER_EXERCISE} sets.`}</p>}
            {confirmingRemove &&
                <Dialog title={`Remove ${name}?`} isWorking={false} showClose onClose={() => setConfirmingRemove(false)}>
                    <p>{`Its ${loggedCount} logged ${loggedCount === 1 ? "set" : "sets"} will be deleted.`}</p>
                    <div className="mt-4 flex gap-2">
                        <Button variant="danger" onClick={confirmRemove}>Remove exercise</Button>
                        <Button variant="secondary" onClick={() => setConfirmingRemove(false)}>Keep it</Button>
                    </div>
                </Dialog>
            }
        </Card>
    )
}
