import type { SetField } from "./exercise-fields"

// One value box of a set row (weight, reps, time or distance), with its error under it.
// Used by the day editor rows and the workout rows.
export default function SetValueInput(props: {
    inputId: string
    field: SetField
    labelText: string
    value: string
    error?: string
    placeholder: string
    disabled?: boolean
    // A ticked set in the workout: the box is tinted.
    done?: boolean
    onChange: (value: string) => void
})
{
    const errorId = `${props.inputId}-error`
    return (
        <div className="flex w-22 shrink-0 flex-col gap-1">
            <label htmlFor={props.inputId} className="sr-only">
                {props.labelText}
            </label>
            <input
            id={props.inputId}
            type="text"
            placeholder={props.placeholder}
            inputMode={props.field.key === "weight" || props.field.key === "distance" ? "decimal" : "numeric"}
            disabled={props.disabled}
            aria-invalid={props.error ? true : undefined}
            aria-describedby={props.error ? errorId : undefined}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            className={`h-11 w-full rounded-md border text-center text-sm font-medium placeholder:text-app-text-muted aria-invalid:border-app-danger ${props.done ? "border-app-primary/40 bg-app-primary/10" : "border-app-border bg-app-canvas"}`}
            />
            {props.error &&
                <p id={errorId} className="text-xs text-app-danger">{props.error}</p>
            }
        </div>
    )
}
