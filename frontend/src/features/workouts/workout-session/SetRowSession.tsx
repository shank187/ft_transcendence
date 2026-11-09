import { useId, useState } from "react";
import Button from "../../../components/ui/Button";
import { validateSet } from "../shared/set-values";
import type { FieldKey, SetField } from "../shared/exercise-fields";
import { toPerformed, toText } from "./workout-session.helpers";
import { PLANNED_KEY, type PerformedValues } from "./workout-session.types";
import type { SetType, WorkoutSessionSet } from "../shared/workouts.types";
import SetTypeMenu from "../shared/SetTypeMenu";

export default function SetRowSession(props:{
    set: WorkoutSessionSet,
    position: number
    fields: SetField[],
    isReadOnly:boolean,
    label: string
    isMenuOpen: boolean
    isMenuBusy: boolean
    toggleSetMenu: () => void,
    onComplete: (setId: string, values: PerformedValues) => Promise<void>
    onUncomplete: () => Promise<void>
    onChangeSetType: (setType: SetType) => void
    onRemoveSet: () => void
    menuError: string | null
})
{
    const id = useId()

    // The text stays in the row while typing; the page only gets numbers on tick.
    const [text, setText] = useState<Record<FieldKey, string>>(() => ({
        weight: toText(props.set.weight),
        reps: toText(props.set.reps),
        duration: toText(props.set.duration),
        distance: toText(props.set.distance),
    }))
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const errors = validateSet(text, props.fields)
    const hasErrors = Object.keys(errors).length > 0
    const done = props.set.completedAt !== null
    const menuId = `${id}-set-menu`

    async function handleUntick()
    {
        setSaving(true)
        setError(null)
        try {
            await props.onUncomplete()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save set.")
        } finally {
            setSaving(false)
        }
    }

    async function handleTick()
    {
        if (props.fields.some(field => text[field.key].trim() === "" && props.set[PLANNED_KEY[field.key]] === null)) {
            setError("Enter the empty values first.")
            return
        }
        
        const plannedForwarding ={
            distance: text.distance.trim() || toText(props.set[PLANNED_KEY["distance"]]), 
            reps: text.reps.trim() || toText(props.set[PLANNED_KEY["reps"]]) ,
            weight: text.weight.trim() || toText(props.set[PLANNED_KEY["weight"]]) ,
            duration: text.duration.trim() || toText(props.set[PLANNED_KEY["duration"]]) ,
        }
        setText(plannedForwarding)
        setSaving(true)
        setError(null)
        try {
            await props.onComplete(props.set.id, toPerformed(plannedForwarding))
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to save set.")
        } finally {
            setSaving(false)
        }
    }

    return(
        <li className="flex flex-col gap-1">
            <div className="flex items-start gap-2">
                <SetTypeMenu
                id={menuId}
                label={props.label}
                currentSetType={props.set.setType}
                isOpen={props.isMenuOpen}
                disabled={props.isReadOnly || props.isMenuBusy}
                toggleSetMenu={props.toggleSetMenu}
                onChangeSetType={props.onChangeSetType}
                onRemoveSet={props.onRemoveSet}
                />
                {props.fields.map((field)=>
                    <div key={field.key} className="flex w-22 shrink-0 flex-col gap-1">
                        <label htmlFor={`${id}-${field.key}`} className="sr-only">
                            {`Set ${props.position} ${field.key}`}
                        </label>
                        <input
                        id={`${id}-${field.key}`}
                        type="text"
                        placeholder={toText(props.set[PLANNED_KEY[field.key]]) || "-"}
                        inputMode={field.key === "weight" || field.key === "distance" ? "decimal" : "numeric"}
                        disabled={saving || done || props.isReadOnly}
                        aria-invalid={errors[field.key] ? true : undefined}
                        aria-describedby={errors[field.key] ? `${id}-${field.key}-error` : undefined}
                        value={text[field.key]}
                        onChange={(e) => setText(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className={`h-11 w-full rounded-md border text-center text-sm font-medium placeholder:text-app-text-muted aria-invalid:border-app-danger ${done ? "border-app-primary/40 bg-app-primary/10" : "border-app-border bg-app-canvas"}`}
                        />
                        {errors[field.key] &&
                            <p id={`${id}-${field.key}-error`} className="text-xs text-app-danger">{errors[field.key]}</p>
                        }
                    </div>
                )}
                <Button
                variant="ghost"
                aria-label={done ? `Mark set ${props.position} not done` : `Complete set ${props.position}`}
                aria-pressed={done}
                disabled={saving || (!done && hasErrors) || props.isReadOnly}
                onClick={() => void (done ? handleUntick() : handleTick())}
                className="size-11 shrink-0 border border-app-border aria-pressed:border-app-primary aria-pressed:bg-app-primary aria-pressed:text-app-canvas"
                >
                    {saving ? "…" : "✓"}
                </Button>
            </div>
            {error && <p role="alert" className="text-xs text-app-danger">{error}</p>}
            {props.menuError && <p role="alert" className="text-xs text-app-danger">{props.menuError}</p>}
        </li>
    )
}
