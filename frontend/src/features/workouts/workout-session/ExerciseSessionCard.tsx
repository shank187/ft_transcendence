import Card from "../../../components/ui/Card";
import type { PerformedValues } from "./workout-session.types";
import type { SetType, WorkoutSessionExercise } from "../shared/workouts.types";
import { EXERCISE_FIELDS, setLabel } from "../shared/exercise-fields";
import SetRowSession from "./SetRowSession";
import { MAX_SETS_PER_EXERCISE } from "../shared/limits";
import Button from "../../../components/ui/Button";
import ExerciseCardHeader from "../shared/ExerciseCardHeader";
import SetColumnsHeader from "../shared/SetColumnsHeader";

export default function ExerciseSessionCard(props:{
    exercise: WorkoutSessionExercise,
    position: number,
    isReadOnly: boolean,
    onAddSet: (exerciseId: string) => void,
    onCompleteSet: (exerciseId: string, setId: string, values: PerformedValues) => Promise<void>,
    onUncompleteSet: (exerciseId: string, setId: string) => Promise<void>,
    isFirst: boolean,
    isLast: boolean,
    isMoving: boolean,
    moveError: string | null,
    onMove: (direction: -1 | 1) => void,
    onChangeSetType: (exerciseId: string, setId: string, setType: SetType) => void,
    onRemoveSet: (exerciseId: string, setId: string) => void,
    isAddingSet: boolean,
    addSetError: string | null,
    setError: { setId: string, message: string } | null,
    toggleSetMenu: (setId: string) => void,
    openSetMenuId: string | null,
    savingSetId: string | null,
    prSetIds: Set<string>,
})
{
    const fields = EXERCISE_FIELDS[props.exercise.exerciseSummary.type]
    const name = props.exercise.exerciseSummary.name
    return(
        <Card className="p-5">
            <ExerciseCardHeader
            position={props.position}
            exercise={props.exercise.exerciseSummary}
            aside={!props.isReadOnly &&
                <div className="flex shrink-0 gap-2">
                    {!props.isFirst &&
                        <Button variant="secondary" disabled={props.isMoving} aria-label={`Move ${name} up`} onClick={() => props.onMove(-1)} className="size-11">↑</Button>
                    }
                    {!props.isLast &&
                        <Button variant="secondary" disabled={props.isMoving} aria-label={`Move ${name} down`} onClick={() => props.onMove(1)} className="size-11">↓</Button>
                    }
                </div>
            }
            />
            {props.moveError && <p role="alert" className="text-app-danger">{props.moveError}</p>}

            <SetColumnsHeader fields={fields} />
            <ol className="flex flex-col gap-3">
                {props.exercise.sets.map((set, i)=>
                    <SetRowSession
                    key={set.id}
                    set={set}
                    position={i + 1}
                    label={setLabel(props.exercise.sets, i)}
                    fields={fields}
                    isReadOnly={props.isReadOnly}
                    isMenuOpen={props.openSetMenuId === set.id}
                    isMenuBusy={props.savingSetId === set.id}
                    isPr={props.prSetIds.has(set.id)}
                    toggleSetMenu={() => props.toggleSetMenu(set.id)}
                    onComplete={(setId, values) => props.onCompleteSet(props.exercise.id, setId, values)}
                    onUncomplete={() => props.onUncompleteSet(props.exercise.id, set.id)}
                    onChangeSetType={(setType) => props.onChangeSetType(props.exercise.id, set.id, setType)}
                    onRemoveSet={() => props.onRemoveSet(props.exercise.id, set.id)}
                    menuError={props.setError?.setId === set.id ? props.setError.message : null}
                    />
                )}
            </ol>
            {(!props.isReadOnly && props.addSetError) && <p className="text-app-danger">{props.addSetError}</p>}
            {!props.isReadOnly && props.exercise.sets.length < MAX_SETS_PER_EXERCISE && <Button disabled={props.isAddingSet} onClick={()=> props.onAddSet(props.exercise.id)}>Add set</Button>}
            {!props.isReadOnly && props.exercise.sets.length >= MAX_SETS_PER_EXERCISE && <p className="text-sm text-app-text-secondary">{`An exercise can have at most ${MAX_SETS_PER_EXERCISE} sets.`}</p>}
        </Card>
    )
}
