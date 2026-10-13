import type { DraftSet } from "./day-editor.types"
import type { SetField } from "./exercise-fields"

export default function SetRow(props:
    {
        label: string
        set: DraftSet
        fields: SetField[]
    })
{
    const {set} = props
    return(
        <div className="flex">
            <p className="w-11">{props.label}</p>
            {props.fields.map((field)=>(
                <span key={field.key} className="w-22" aria-label={field.label}>{set[field.key]}</span>
            ))}
        </div>
    )
}