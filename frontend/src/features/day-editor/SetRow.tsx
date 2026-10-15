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
        <div className="flex">
            <p className="w-11">{props.label}</p>
            {props.fields.map((field)=>(
                <div key={field.key} className="w-22">
                    <label htmlFor={`${id}-${field.key}`} className="sr-only">
                        {`Set ${props.label} ${field.key}`}
                    </label>
                    <input
                    id={`${id}-${field.key}`}
                    type="text"
                    inputMode={field.key === "weight" || field.key === "distance" ? "decimal" : "numeric"}
                    className="w-full"
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
            <Button variant="danger" aria-label={`Remove set ${props.label}`} onClick={()=> props.onRemoveSet(props.exKey, set.key)}>D</Button>
        </div>
    )
}
