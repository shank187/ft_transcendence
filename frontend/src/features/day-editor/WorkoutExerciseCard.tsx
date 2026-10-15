import { useId } from "react"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import type { DraftExercise} from "./day-editor.types"
import { EXERCISE_FIELDS, EXERCISE_TYPE_LABEL, type FieldKey } from "./exercise-fields"
import SetRow from "./SetRow"
import { validateRest } from "./day-editor.draft"

export default function WorkoutExerciseCard(props: {
    exercise: DraftExercise,
    position: number ,
    onRemove: (key : DraftExercise["key"]) => void
    onMove: (key : DraftExercise["key"], direction: -1|1) => void
    onAddSet: (key: string) => void
    onRemoveSet: (exkey: string, setkey: string) => void
    onFieldChange: (exkey: string, setkey: string, field: FieldKey, value: string) => void
    onChangeRest: (exKey: string, value: string)=> void
    isFirst: boolean
    isLast: boolean
}
) {
    const id = useId()

    const restId = `${id}-rest`
    const restErrorId = `${id}-rest-error`

    const { exercise } = props
    const fields = EXERCISE_FIELDS[exercise.exerciseSummary.type]
    const type = EXERCISE_TYPE_LABEL[exercise.exerciseSummary.type]
    const primary = exercise.exerciseSummary.primaryMuscle
    const name = exercise.exerciseSummary.name

    const restTimeErr = validateRest(exercise.restSeconds)

    return (
        <Card>
            <div className="flex gap-3 border">
                <div className="border border-app-border p-2 px-3 rounded">{props.position}</div>
                <div>
                    <h2>{exercise.exerciseSummary.name}</h2>
                    <p>{type} · {primary}</p>
                    <p>{exercise.restSeconds === "" ? "No rest timer" : `Rest ${exercise.restSeconds}s`}</p>
                    <input
                        id={restId}
                        type="text"
                        className="w-full"
                        value={exercise.restSeconds}
                        aria-invalid = {restTimeErr ? true : undefined}
                        aria-describedby={restTimeErr? restErrorId: undefined}
                        onChange={(e)=> {
                            props.onChangeRest(exercise.key, e.target.value)
                        }}
                    />
                    <label htmlFor={restId} className="sr-only">
                        {`Rest time for ${name}, in seconds`}
                    </label>
                    {restTimeErr && <p id={restErrorId} className="text-xs text-app-danger">{restTimeErr}</p>}
                </div>
                <div>
                    <Button disabled={props.isFirst} aria-label={`Move ${name} up`} onClick={() => props.onMove(exercise.key, -1)}>Move up</Button>
                    <Button disabled={props.isLast} aria-label={`Move ${name} down`} onClick={() => props.onMove(exercise.key, 1)}>Move down</Button>
                    <Button variant="danger" aria-label={`Remove ${name}`} onClick={() => props.onRemove(exercise.key)}>Remove</Button>
                </div>
            </div>
    
            <div className="flex gap-2 text-xs text-app-text-muted" aria-hidden="true">
                <span className="w-11">SET</span>
                {fields.map(field => (
                    <span key={field.key} className="w-22">{field.label}</span>
                ))}
            </div>

            <ol>
                {exercise.sets.map((set, i) => (
                    <li key={set.key}>
                        <SetRow exkey={exercise.key} onRemoveSet={props.onRemoveSet} onFieldChange={props.onFieldChange} set={set} label={set.setType === "NORMAL" ? String(i + 1) : "X"} fields={fields} />
                    </li>
                ))}
            </ol>
            <div>
                <Button onClick={()=> props.onAddSet(exercise.key)}>+ Add set</Button>
            </div>
        </Card>
    )
}

