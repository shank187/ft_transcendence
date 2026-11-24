import type { Dispatch } from "react"
import { Plus } from "lucide-react"
import type { DraftExercise } from "./day-editor.types"
import type { DraftAction } from "./day-editor.draft"
import { EXERCISE_FIELDS, setLabel } from "../shared/exercise-fields"
import { MAX_SETS_PER_EXERCISE } from "../shared/limits"
import ExerciseCardHeader from "../shared/ExerciseCardHeader"
import ExerciseCardActions from "../shared/ExerciseCardActions"
import SetColumnsHeader from "../shared/SetColumnsHeader"
import SetRow from "./SetRow"

interface WorkoutExerciseCardProps {
    exercise: DraftExercise
    position: number
    dispatch: Dispatch<DraftAction>
    openSetMenu: string | null
    setOpenSetMenu: (setKey: string | null) => void
    isFirst: boolean
    isLast: boolean
}

export default function WorkoutExerciseCard(props: WorkoutExerciseCardProps)
{
    const { exercise, dispatch } = props
    const fields = EXERCISE_FIELDS[exercise.exerciseSummary.type]

    return (
        <article className="flex flex-col gap-2.5 rounded-2xl border border-app-border bg-app-surface p-3.5">
            <ExerciseCardHeader
            position={props.position}
            exercise={exercise.exerciseSummary}
            aside={
                <ExerciseCardActions
                name={exercise.exerciseSummary.name}
                isFirst={props.isFirst}
                isLast={props.isLast}
                onMove={direction => dispatch({ type: "exerciseMoved", exKey: exercise.key, direction })}
                onRemove={() => dispatch({ type: "exerciseRemoved", exKey: exercise.key })}
                />
            }
            />

            <SetColumnsHeader fields={fields} />
            <ol className="flex flex-col gap-2">
                {exercise.sets.map((set, i) => (
                    <li key={set.key}>
                        <SetRow
                        exKey={exercise.key}
                        dispatch={dispatch}
                        isMenuOpen={props.openSetMenu === set.key}
                        setOpenSetMenu={props.setOpenSetMenu}
                        set={set}
                        label={setLabel(exercise.sets, i)}
                        fields={fields}
                        />
                    </li>
                ))}
            </ol>
            {exercise.sets.length < MAX_SETS_PER_EXERCISE
                ? <button type="button" onClick={() => dispatch({ type: "setAdded", exKey: exercise.key })} className="flex h-11 items-center justify-center gap-1.5 rounded-lg bg-app-surface-hover text-sm font-semibold hover:brightness-125">
                    <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
                    Add set
                </button>
                : <p className="text-sm text-app-text-secondary">{`An exercise can have at most ${MAX_SETS_PER_EXERCISE} sets.`}</p>
            }
        </article>
    )
}
