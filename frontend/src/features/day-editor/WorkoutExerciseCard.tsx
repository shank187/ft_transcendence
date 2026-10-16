import { useId } from "react"
import Button from "../../components/ui/Button"
import Card from "../../components/ui/Card"
import type { DraftExercise, SetType} from "./day-editor.types"
import { EXERCISE_FIELDS, EXERCISE_TYPE_LABEL, SET_TYPE_LETTER, type FieldKey } from "./exercise-fields"
import SetRow from "./SetRow"
import { validateRest } from "./day-editor.draft"

export default function WorkoutExerciseCard(props: {
    exercise: DraftExercise,
    position: number ,
    onRemove: (key : DraftExercise["key"]) => void
    onMove: (key : DraftExercise["key"], direction: -1|1) => void
    onAddSet: (key: string) => void
    onRemoveSet: (exKey: string, setKey: string) => void
    onFieldChange: (exKey: string, setkey: string, field: FieldKey, value: string) => void
    onChangeRest: (exKey: string, value: string)=> void
    onSetTypeChange: (exKey: string, setKey: string, setType: SetType) => void
    openSetMenu: string | null
    setOpenSetMenu: (setKey: string | null) => void
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

    const restError = validateRest(exercise.restSeconds)

    return (
        <Card className="flex gap-2">
            <div className="flex min-w-0 flex-1 flex-col gap-3">
                <div className="flex items-start gap-3">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-app-surface-hover text-[13px] font-semibold">{props.position}</div>
                    <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                        <h2 className="font-semibold wrap-break-word">{exercise.exerciseSummary.name}</h2>
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                            <p className="text-[13px] text-app-text-muted">{type} · {primary}</p>
                            <div className="flex items-center gap-1.5 rounded-full border border-app-border py-0.5 pl-2.5 pr-2 text-xs font-medium text-app-text-muted">
                                <span aria-hidden="true">Rest</span>
                                <input
                                    id={restId}
                                    type="text"
                                    placeholder="–"
                                    className="h-6 w-12 rounded-sm border border-app-border bg-app-canvas text-center text-app-text placeholder:text-app-text-muted aria-invalid:border-app-danger"
                                    value={exercise.restSeconds}
                                    aria-invalid = {restError ? true : undefined}
                                    aria-describedby={restError? restErrorId: undefined}
                                    onChange={(e)=> {
                                        props.onChangeRest(exercise.key, e.target.value)
                                    }}
                                />
                                <label htmlFor={restId} className="sr-only">
                                    {`Rest time for ${name}, in seconds`}
                                </label>
                                <span aria-hidden="true">s</span>
                            </div>
                        </div>
                        {restError && <p id={restErrorId} className="text-xs text-app-danger">{restError}</p>}
                    </div>
                </div>

                <div className="flex gap-2 text-[11px] font-medium tracking-wider text-app-text-muted" aria-hidden="true">
                    <span className="w-11 shrink-0">SET</span>
                    {fields.map(field => (
                        <span key={field.key} className="w-22 shrink-0">{field.label}</span>
                    ))}
                </div>

                <ol className="flex flex-col gap-3">
                    {exercise.sets.map((set, i) => (
                        <li key={set.key}>
                            <SetRow
                            exKey={exercise.key}
                            onRemoveSet={props.onRemoveSet}
                            onFieldChange={props.onFieldChange}
                            onSetTypeChange={props.onSetTypeChange}
                            isMenuOpen={props.openSetMenu === set.key}
                            setOpenSetMenu={props.setOpenSetMenu}
                            set={set}
                            label={set.setType === "NORMAL"
                                ? String(exercise.sets.slice(0, i + 1).filter(s => s.setType === "NORMAL").length)
                                : SET_TYPE_LETTER[set.setType]}
                            fields={fields}
                            />
                        </li>
                    ))}
                </ol>
                <div>
                    <Button variant="ghost" onClick={()=> props.onAddSet(exercise.key)} className="min-h-11">+ Add set</Button>
                </div>
            </div>

            <div className="flex shrink-0 flex-col justify-between gap-3 border-l border-app-border pl-2">
                <div className="flex flex-col overflow-hidden rounded-md border border-app-border">
                    <Button variant="ghost" disabled={props.isFirst} aria-label={`Move ${name} up`} title={`Move ${name} up`} onClick={() => props.onMove(exercise.key, -1)} className="size-11 text-lg">↑</Button>
                    <Button variant="ghost" disabled={props.isLast} aria-label={`Move ${name} down`} title={`Move ${name} down`} onClick={() => props.onMove(exercise.key, 1)} className="size-11 border-t border-app-border text-lg">↓</Button>
                </div>
                <Button variant="ghost" aria-label={`Remove ${name}`} title={`Remove ${name}`} onClick={() => props.onRemove(exercise.key)} className="size-11 border border-app-border hover:text-app-danger">
                    <svg aria-hidden="true" className="shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />
                    </svg>
                </Button>
            </div>
        </Card>
    )
}

