import { useId } from "react"
import Button from "../../components/ui/Button"
import type { DraftSet } from "./day-editor.types"
import { validateSet } from "./day-editor.draft"
import type { FieldKey, SetField } from "./exercise-fields"

export default function SetRow(props:
    {
        label: string
        set: DraftSet
        fields: SetField[]
        exKey: string,
        onRemoveSet: (exKey: string, setkey: string) => void
        onFieldChange: (exKey: string, setkey: string, field: FieldKey, value: string) => void
    })
{
    const {set} = props 
    const id = useId()
    const errors = validateSet(set, props.fields)
    return(
        <div className="flex items-start gap-2">
            {/* STYLE: Figma makes the set number a button that opens the set menu (Remove set, set types). Planned for UI 6/7; until then it stays a label next to its own Remove set button. */}
            <p className="flex size-11 shrink-0 items-center justify-center rounded-md border border-app-border bg-app-surface-hover text-sm font-medium">{props.label}</p>
            {props.fields.map((field)=>(
                <div key={field.key} className="flex w-22 shrink-0 flex-col gap-1">
                    <label htmlFor={`${id}-${field.key}`} className="sr-only">
                        {`Set ${props.label} ${field.key}`}
                    </label>
                    <input
                    id={`${id}-${field.key}`}
                    type="text"
                    inputMode={field.key === "weight" || field.key === "distance" ? "decimal" : "numeric"}
                    className="h-11 w-full rounded-md border border-app-border bg-app-canvas text-center text-sm font-medium aria-invalid:border-app-danger"
                    aria-invalid={errors[field.key] ? true : undefined}
                    aria-describedby={errors[field.key] ? `${id}-${field.key}-error` : undefined}
                    value={set[field.key]}
                    onChange={(e)=> props.onFieldChange(props.exKey, set.key, field.key, e.target.value)}
                    />
                    {errors[field.key] &&
                        <p id={`${id}-${field.key}-error`} className="text-xs text-app-danger">{errors[field.key]}</p>
                    }
                </div>
            ))}
            <Button variant="danger" aria-label={`Remove set ${props.label}`} onClick={()=> props.onRemoveSet(props.exKey, set.key)} className="size-11 shrink-0">D</Button>
        </div>
    )
}
