import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import type { DraftExercise} from "./day-editor.types"
import { EXERCISE_FIELDS, EXERCISE_TYPE_LABEL } from "./exercise-fields"
import SetRow from "./SetRow"

export default function WorkoutExerciseCard(props: {
    exercise: DraftExercise,
    position: number ,
    onRemove: (key : DraftExercise["key"]) => void
    onMove: (key : DraftExercise["key"], direction: -1|1) => void
    onAddSet: (key: string) => void
    onRemoveSet: (exkey: string, setkey: string) => void
    isFirst: boolean
    isLast: boolean
}
) {

    const { exercise } = props
    const fields = EXERCISE_FIELDS[exercise.exerciseSummary.type]
    const type = EXERCISE_TYPE_LABEL[exercise.exerciseSummary.type]
    const primary = exercise.exerciseSummary.primaryMuscle
    const name = exercise.exerciseSummary.name

    return (
        <Card>
            <div className="flex gap-3 border">
                <div className="border border-app-border p-2 px-3 rounded">{props.position}</div>
                <div>
                    <h2>{exercise.exerciseSummary.name}</h2>
                    <p>{type} · {primary}</p>
                    <p>{exercise.restSeconds === "" ? "No rest timer" : `Rest ${exercise.restSeconds} s`}</p>
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
                        <SetRow exkey={exercise.key} onRemoveSet={props.onRemoveSet} set={set} label={set.setType === "NORMAL" ? String(i + 1) : "X"} fields={fields} />
                    </li>
                ))}
            </ol>
            <div>
                <Button onClick={()=> props.onAddSet(exercise.key)}>+ Add set</Button>
            </div>
        </Card>
    )
}