import type { SetField } from "./exercise-fields"

interface SetValueInputProps {
    inputId: string
    field: SetField
    labelText: string
    value: string
    error?: string
    placeholder: string
    disabled?: boolean
    // A ticked set: the box blends into the tinted row.
    done?: boolean
    // The next set to do in a workout: teal ring.
    highlight?: boolean
    onChange: (value: string) => void
}

export default function SetValueInput(props: SetValueInputProps)
{
    const errorId = `${props.inputId}-error`
    const stateClasses = props.done
        ? "border-transparent bg-transparent"
        : props.highlight
            ? "border-app-primary bg-app-surface-raised"
            : "border-app-border bg-app-surface-raised"

    return (
        <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor={props.inputId} className="sr-only">
                {props.labelText}
            </label>
            <input
            id={props.inputId}
            type="text"
            placeholder={props.placeholder}
            inputMode={props.field.key === "duration" ? "text" : props.field.key === "reps" ? "numeric" : "decimal"}
            disabled={props.disabled}
            aria-invalid={props.error ? true : undefined}
            aria-describedby={props.error ? errorId : undefined}
            value={props.value}
            onChange={(e) => props.onChange(e.target.value)}
            className={`h-11 w-full min-w-0 rounded-lg border text-center text-base font-semibold tabular-nums placeholder:font-normal placeholder:text-app-text-muted aria-invalid:border-app-danger ${stateClasses}`}
            />
            {props.error &&
                <p id={errorId} className="text-xs text-app-danger">{props.error}</p>
            }
        </div>
    )
}
