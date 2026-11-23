import { useId, useState } from "react";
import { Check, Trophy } from "lucide-react";
import { FIELDS_BY_UNIT, mapFields, validateSet, type FieldKey } from "../shared/set-values";
import type { SetField } from "../shared/exercise-fields";
import type { WorkoutSessionSet } from "../shared/workouts.types";
import SetTypeMenu from "../shared/SetTypeMenu";
import SetValueInput from "../shared/SetValueInput";
import { useWorkoutSession } from "./WorkoutSessionContext";
import { useUnitSystem } from "../shared/use-unit-system";

interface SetRowSessionProps {
    exerciseId: string
    set: WorkoutSessionSet
    position: number
    label: string
    fields: SetField[]
    // The workout's first unticked set gets the teal ring.
    isNext: boolean
}

export default function SetRowSession(props: SetRowSessionProps)
{
    const { set, exerciseId } = props
    const { isReadOnly, prSetIds, completeSet, uncompleteSet, openSetMenuId, toggleSetMenu, changeSetType, removeSet, setMenu } = useWorkoutSession()
    const id = useId()
    const units = useUnitSystem()
    const fieldDefs = FIELDS_BY_UNIT[units]

    // The text stays in the row while typing; the page only gets numbers on tick.
    const [text, setText] = useState<Record<FieldKey, string>>(() => mapFields(key => fieldDefs[key].format(set[key])))
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    const errors = validateSet(text, props.fields, units)
    const hasErrors = Object.keys(errors).length > 0
    const done = set.completedAt !== null
    const highlight = props.isNext && !isReadOnly
    const plannedText = (key: FieldKey) => fieldDefs[key].format(set[fieldDefs[key].planned])
    const menuError = setMenu.error?.id === set.id ? setMenu.error.message : null
    const tickClasses = done
        ? "border-app-primary bg-app-primary text-app-canvas"
        : highlight
            ? "border-app-primary text-app-primary"
            : "border-app-border text-app-text-muted"

    async function save(request: () => Promise<void>)
    {
        setSaving(true)
        setSaveError(null)
        try {
            await request()
        } catch (err) {
            setSaveError(err instanceof Error ? err.message : "Failed to save set.")
        } finally {
            setSaving(false)
        }
    }

    function handleTick()
    {
        if (props.fields.some(({ key }) => text[key].trim() === "" && set[fieldDefs[key].planned] === null)) {
            setSaveError("Enter the empty values first.")
            return
        }
        // An empty box takes the planned value.
        const filled = mapFields(key => text[key].trim() || plannedText(key))
        setText(filled)
        void save(() => completeSet(exerciseId, set.id, mapFields(key => fieldDefs[key].parse(filled[key]))))
    }

    return(
        <li className="flex flex-col gap-1">
            {/* -mx-1 p-1: the tint gets a margin while the columns stay under SetColumnsHeader. */}
            <div className={`-mx-1 flex items-start gap-2 rounded-xl p-1 transition-colors ${done ? "bg-app-primary/8" : ""}`}>
                <div className="relative shrink-0">
                    <SetTypeMenu
                    id={`${id}-set-menu`}
                    label={props.label}
                    currentSetType={set.setType}
                    isOpen={openSetMenuId === set.id}
                    disabled={isReadOnly || setMenu.busyId === set.id}
                    toggleSetMenu={() => toggleSetMenu(set.id)}
                    onChangeSetType={(setType) => changeSetType(exerciseId, set.id, setType)}
                    onRemoveSet={() => removeSet(exerciseId, set.id)}
                    />
                    {prSetIds.has(set.id) &&
                        <span role="img" aria-label="Personal record" title="Personal record" className="pointer-events-none absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full border-2 border-app-surface bg-amber-400 text-app-canvas">
                            <Trophy aria-hidden="true" className="size-2.5" strokeWidth={3} />
                        </span>
                    }
                </div>
                {props.fields.map((field)=>
                    <SetValueInput
                    key={field.key}
                    inputId={`${id}-${field.key}`}
                    field={field}
                    labelText={`Set ${props.position} ${field.key}`}
                    placeholder={plannedText(field.key) || "—"}
                    disabled={saving || done || isReadOnly}
                    done={done}
                    highlight={highlight}
                    value={text[field.key]}
                    error={errors[field.key]}
                    onChange={(value) => setText(prev => ({ ...prev, [field.key]: value }))}
                    />
                )}
                <button
                type="button"
                aria-label={done ? `Mark set ${props.position} not done` : `Complete set ${props.position}`}
                aria-pressed={done}
                disabled={saving || (!done && hasErrors) || isReadOnly}
                onClick={() => done ? void save(() => uncompleteSet(exerciseId, set.id)) : handleTick()}
                className={`flex size-11 shrink-0 items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${tickClasses}`}
                >
                    {saving ? "…" : <Check aria-hidden="true" className="size-5" strokeWidth={3} />}
                </button>
            </div>
            {saveError && <p role="alert" className="ml-13 text-xs text-app-danger">{saveError}</p>}
            {menuError && <p role="alert" className="ml-13 text-xs text-app-danger">{menuError}</p>}
        </li>
    )
}
