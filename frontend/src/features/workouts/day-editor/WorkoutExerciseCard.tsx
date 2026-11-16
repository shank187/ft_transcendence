import { useId, type Dispatch } from "react"
import Button from "../../../components/ui/Button"
import Card from "../../../components/ui/Card"
import type { DraftExercise } from "./day-editor.types"
import { EXERCISE_FIELDS, setLabel } from "../shared/exercise-fields"
import SetRow from "./SetRow"
import { validateRest, type DraftAction } from "./day-editor.draft"
import { MAX_SETS_PER_EXERCISE } from "../shared/limits"
import ExerciseCardHeader from "../shared/ExerciseCardHeader"
import SetColumnsHeader from "../shared/SetColumnsHeader"

export default function WorkoutExerciseCard(props: {
    exercise: DraftExercise,
    position: number ,
    dispatch: Dispatch<DraftAction>
    openSetMenu: string | null
    setOpenSetMenu: (setKey: string | null) => void
    isFirst: boolean
    isLast: boolean
}
) {
    const id = useId()

    const restId = `${id}-rest`
    const restErrorId = `${id}-rest-error`

    const { exercise, dispatch } = props
    const fields = EXERCISE_FIELDS[exercise.exerciseSummary.type]
    const name = exercise.exerciseSummary.name

    const restError = validateRest(exercise.restSeconds)

    return (
        <Card className="flex gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
                <ExerciseCardHeader
                position={props.position}
                exercise={exercise.exerciseSummary}
                metaExtra={
                    <div className="flex items-center gap-1.5 rounded-full border border-app-border py-0.5 pl-2.5 pr-2 text-xs font-medium text-app-text-muted">
                        <span aria-hidden="true">Rest</span>
                        <input
                            id={restId}
                            type="text"
                            inputMode="numeric"
                            placeholder="–"
                            className="h-6 w-12 rounded-sm border border-app-border bg-app-canvas text-center text-app-text placeholder:text-app-text-muted aria-invalid:border-app-danger"
                            value={exercise.restSeconds}
                            aria-invalid = {restError ? true : undefined}
                            aria-describedby={restError? restErrorId: undefined}
                            onChange={(e)=> {
                                dispatch({ type: "restChanged", exKey: exercise.key, value: e.target.value })
                            }}
                        />
                        <label htmlFor={restId} className="sr-only">
                            {`Rest time for ${name}, in seconds`}
                        </label>
                        <span aria-hidden="true">s</span>
                    </div>
                }
                >
                    {restError && <p id={restErrorId} className="text-xs text-app-danger">{restError}</p>}
                </ExerciseCardHeader>

                <SetColumnsHeader fields={fields} />

                <ol className="flex flex-col gap-3">
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
                <div>
                    {exercise.sets.length < MAX_SETS_PER_EXERCISE
                        ? <Button variant="ghost" onClick={()=> dispatch({ type: "setAdded", exKey: exercise.key })} className="min-h-11">+ Add set</Button>
                        : <p className="text-sm text-app-text-secondary">{`An exercise can have at most ${MAX_SETS_PER_EXERCISE} sets.`}</p>
                    }
                </div>
            </div>

            <div className="flex shrink-0 flex-col justify-between gap-3 border-l border-app-border pl-2">
                <div className="flex flex-col overflow-hidden rounded-md border border-app-border">
                    <Button variant="ghost" disabled={props.isFirst} aria-label={`Move ${name} up`} title={`Move ${name} up`} onClick={() => dispatch({ type: "exerciseMoved", exKey: exercise.key, direction: -1 })} className="size-11 text-lg">↑</Button>
                    <Button variant="ghost" disabled={props.isLast} aria-label={`Move ${name} down`} title={`Move ${name} down`} onClick={() => dispatch({ type: "exerciseMoved", exKey: exercise.key, direction: 1 })} className="size-11 border-t border-app-border text-lg">↓</Button>
                </div>
                <Button variant="ghost" aria-label={`Remove ${name}`} title={`Remove ${name}`} onClick={() => dispatch({ type: "exerciseRemoved", exKey: exercise.key })} className="size-11 border border-app-border hover:text-app-danger">
                    <svg aria-hidden="true" className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                    </svg>
                </Button>
            </div>
        </Card>
    )
}

