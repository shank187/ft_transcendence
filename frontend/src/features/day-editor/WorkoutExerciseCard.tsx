import Card from "../../components/ui/Card"
import type { DraftExercise } from "./day-editor.types"
import { EXERCISE_FIELDS, EXERCISE_TYPE_LABEL } from "./exercise-fields"

export default function WorkoutExerciseCard(props: { exercise: DraftExercise, position: number }) {
    const { exercise } = props
    const fields = EXERCISE_FIELDS[exercise.exerciseSummary.type]
    const type = EXERCISE_TYPE_LABEL[exercise.exerciseSummary.type]
    const primary = exercise.exerciseSummary.primaryMuscle
    
    return (
        <Card>
            <div className="flex gap-3 border">
                <div className="border border-app-border p-2 px-3 rounded">{props.position}</div>
                <div>
                    <h1>{exercise.exerciseSummary.name}</h1>
                    <p>{type}.{primary}</p>
                    <p>{exercise.restSeconds}</p>
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
                        {/* TODO 3: <SetRow set={set} label={String(i + 1)} fields={fields} /> */}
                    </li>
                ))}
            </ol>
        </Card>
    )
}