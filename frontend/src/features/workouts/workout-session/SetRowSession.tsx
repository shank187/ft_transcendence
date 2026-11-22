import { useId, useState } from "react";
import { Trophy } from "lucide-react";
import Button from "../../../components/ui/Button";
import { FIELDS, mapFields, validateSet, type FieldKey } from "../shared/set-values";
import type { SetField } from "../shared/exercise-fields";
import type { WorkoutSessionSet } from "../shared/workouts.types";
import SetTypeMenu from "../shared/SetTypeMenu";
import SetValueInput from "../shared/SetValueInput";
import { useWorkoutSession } from "./WorkoutSessionContext";

export default function SetRowSession(props:{
    exerciseId: string
    set: WorkoutSessionSet
    position: number
    label: string
    fields: SetField[]
})
{
    const { set, exerciseId } = props
    const { isReadOnly, prSetIds, completeSet, uncompleteSet, openSetMenuId, toggleSetMenu, changeSetType, removeSet, setMenu } = useWorkoutSession()
    const id = useId()

    // The text stays in the row while typing; the page only gets numbers on tick.
    const [text, setText] = useState<Record<FieldKey, string>>(() => mapFields(key => FIELDS[key].format(set[key])))
    const [saving, setSaving] = useState(false)
    const [saveError, setSaveError] = useState<string | null>(null)

    const errors = validateSet(text, props.fields)
    const hasErrors = Object.keys(errors).length > 0
    const done = set.completedAt !== null
    const plannedText = (key: FieldKey) => FIELDS[key].format(set[FIELDS[key].planned])
    const menuError = setMenu.error?.id === set.id ? setMenu.error.message : null

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
        if (props.fields.some(({ key }) => text[key].trim() === "" && set[FIELDS[key].planned] === null)) {
            setSaveError("Enter the empty values first.")
            return
        }
        // An empty box takes the planned value.
        const filled = mapFields(key => text[key].trim() || plannedText(key))
        setText(filled)
        void save(() => completeSet(exerciseId, set.id, mapFields(key => FIELDS[key].parse(filled[key]))))
    }

    return(
        <li className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
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
                {props.fields.map((field)=>
                    <SetValueInput
                    key={field.key}
                    inputId={`${id}-${field.key}`}
                    field={field}
                    labelText={`Set ${props.position} ${field.key}`}
                    placeholder={plannedText(field.key) || "-"}
                    disabled={saving || done || isReadOnly}
                    done={done}
                    value={text[field.key]}
                    error={errors[field.key]}
                    onChange={(value) => setText(prev => ({ ...prev, [field.key]: value }))}
                    />
                )}
                <Button
                variant="ghost"
                aria-label={done ? `Mark set ${props.position} not done` : `Complete set ${props.position}`}
                aria-pressed={done}
                disabled={saving || (!done && hasErrors) || isReadOnly}
                onClick={() => done ? void save(() => uncompleteSet(exerciseId, set.id)) : handleTick()}
                className="size-11 shrink-0 border border-app-border aria-pressed:border-app-primary aria-pressed:bg-app-primary aria-pressed:text-app-canvas"
                >
                    {saving ? "…" : "✓"}
                </Button>
            </div>
            {prSetIds.has(set.id) &&
                <p className="flex items-center gap-1 text-xs font-semibold text-app-primary">
                    <Trophy aria-hidden="true" className="size-4" />
                    PR
                </p>
            }
            {saveError && <p role="alert" className="text-xs text-app-danger">{saveError}</p>}
            {menuError && <p role="alert" className="text-xs text-app-danger">{menuError}</p>}
        </li>
    )
}
