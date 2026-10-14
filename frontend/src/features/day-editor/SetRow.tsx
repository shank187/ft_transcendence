import Button from "../../components/ui/Button"
import type { DraftSet } from "./day-editor.types"
import type { SetField } from "./exercise-fields"

export default function SetRow(props:
    {
        label: string
        set: DraftSet
        fields: SetField[]
        exkey: string,
        onRemoveSet: (exkey: string, setkey: string) => void
    })
{
    const {set} = props
    return(
        <div className="flex">
            <p className="w-11">{props.label}</p>
            {props.fields.map((field)=>(
                <span
                key={field.key}
                className="w-22"
                aria-label={field.label}
                >
                    {set[field.key] === "" ? "–" : set[field.key]}
                </span>
            ))}
                        <Button variant="danger" onClick={()=> props.onRemoveSet(props.exkey, set.key)}>D</Button>

        </div>
    )
}