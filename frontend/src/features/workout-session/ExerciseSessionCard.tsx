import Card from "../../components/ui/Card";
import type { PerformedValues, WorkoutSessionExercise } from "./workout-session.types";
import { EXERCISE_FIELDS, EXERCISE_TYPE_LABEL } from "../day-editor/exercise-fields";
import SetRowSession from "./SetRowSession";
import Button from "../../components/ui/Button";

export default function ExerciseSessionCard(props:{
    exercise: WorkoutSessionExercise,
    position: number,
    isReadOnly: boolean,
    onAddSet: (exerciseId: string) => void,
    onCompleteSet: (exerciseId: string, setId: string, values: PerformedValues) => Promise<void>,
    isAddingSet: boolean,
    addSetError: string | null
})
{
    const exerciseType = EXERCISE_TYPE_LABEL[props.exercise.exerciseSummary.type];
    const fields = EXERCISE_FIELDS[props.exercise.exerciseSummary.type]
    return(
        <Card className="p-5">
            <div className="flex gap-3">
                <p>{props.position}</p>
                <div>
                    <h2>{props.exercise.exerciseSummary.name}</h2>
                    <p className="text-app-text-muted">
                        {props.exercise.exerciseSummary.primaryMuscle} | {exerciseType}
                    </p>
                </div>
            </div>

            <div className="flex gap-2 text-[11px] font-medium tracking-wider text-app-text-muted" aria-hidden="true">
                <span className="w-11 shrink-0">SET</span>
                {fields.map(field => (
                    <span key={field.key} className="w-22 shrink-0">{field.label}</span>
                ))}
            </div>
            <ol className="flex flex-col gap-3">
                {props.exercise.sets.map((set, i)=>
                    <SetRowSession
                    isReadOnly={props.isReadOnly}
                    key={set.id}
                    position={i + 1}
                    set={set}
                    fields={fields}
                    onComplete={(setId, values) => props.onCompleteSet(props.exercise.id, setId, values)}
                    />
                )}
            </ol>
            {(!props.isReadOnly && props.addSetError) && <p className="text-app-danger">{props.addSetError}</p>}
            {!props.isReadOnly && <Button  disabled={props.isAddingSet} onClick={()=> props.onAddSet(props.exercise.id)}>Add set</Button>}
        </Card>
    )
}
