import { useId } from "react"
import Button from "../../components/ui/Button"
import type { DraftSet } from "./day-editor.types"
import type { FieldKey, SetField } from "./exercise-fields"

export default function SetRow(props:
    {
        label: string
        set: DraftSet
        fields: SetField[]
        exkey: string,
        onRemoveSet: (exkey: string, setkey: string) => void
        onFieldChange: (exkey: string, setkey: string, field: FieldKey, value: string) => void
    })
{
    const {set} = props
    const id = useId()
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
                    value={set[field.key]}
                    onChange={(e)=> props.onFieldChange(props.exkey, set.key, field.key, e.target.value)}
                    />
                </div>
            ))}
            <Button variant="danger" aria-label={`Remove set ${props.label}`} onClick={()=> props.onRemoveSet(props.exkey, set.key)}>D</Button>
        </div>
    )
}
