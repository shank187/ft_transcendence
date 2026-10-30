import { useId, useState } from "react";
import Button from "../../components/ui/Button";
import { validateSet } from "../day-editor/day-editor.draft";
import type { FieldKey, SetField } from "../day-editor/exercise-fields";
import { toPerformed, toText } from "./workout-session.helpers";
import { PLANNED_KEY, type PerformedValues, type WorkoutSessionSet } from "./workout-session.types";

export default function SetRowSession(props:{
    set: WorkoutSessionSet,
    position: number
    fields: SetField[]
    onComplete: (setId: string, values: PerformedValues) => Promise<void>
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
    // Untick is not built yet, so a done set is read-only.
    const done = props.set.completedAt !== null

    async function handleTick()
    {
        if (props.fields.some(field => text[field.key].trim() === "" && props.set[PLANNED_KEY[field.key]] === null)) {
            setError("Fill in every non-planned field first.")
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
                <span className="flex h-11 w-11 shrink-0 items-center justify-center">{props.position}</span>
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
                        disabled={saving || done}
                        aria-invalid={errors[field.key] ? true : undefined}
                        aria-describedby={errors[field.key] ? `${id}-${field.key}-error` : undefined}
                        value={text[field.key]}
                        onChange={(e) => setText(prev => ({ ...prev, [field.key]: e.target.value }))}
                        className="h-11 w-full rounded-md border border-app-border bg-app-canvas text-center text-sm font-medium placeholder:text-app-text-muted aria-invalid:border-app-danger"
                        />
                        {errors[field.key] &&
                            <p id={`${id}-${field.key}-error`} className="text-xs text-app-danger">{errors[field.key]}</p>
                        }
                    </div>
                )}
                {/* STYLE: done look (green row) is layer 4 */}
                <Button
                variant="ghost"
                aria-label={`Complete set ${props.position}`}
                aria-pressed={done}
                disabled={saving || done || hasErrors}
                onClick={() => void handleTick()}
                className="size-11 shrink-0 border border-app-border"
                >
                    {saving ? "…" : "✓"}
                </Button>
            </div>
            {error && <p role="alert" className="text-xs text-app-danger">{error}</p>}
        </li>
    )
}
