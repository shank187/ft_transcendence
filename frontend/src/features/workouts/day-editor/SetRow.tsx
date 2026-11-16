import {useId} from "react"
import type { DraftSet } from "./day-editor.types"
import type { SetType } from "../shared/workouts.types"
import { validateSet } from "../shared/set-values"
import {type FieldKey, type SetField } from "../shared/exercise-fields"
import SetTypeMenu from "../shared/SetTypeMenu"
import SetValueInput from "../shared/SetValueInput"


export default function SetRow(props:
    {
        label: string
        set: DraftSet
        fields: SetField[]
        exKey: string,
        isMenuOpen: boolean
        setOpenSetMenu: (setKey: string | null) => void
        onRemoveSet: (exKey: string, setkey: string) => void
        onFieldChange: (exKey: string, setkey: string, field: FieldKey, value: string) => void
        onSetTypeChange: (exKey: string, setKey: string, setType: SetType) => void
    })
{
    const {set, isMenuOpen, setOpenSetMenu} = props
    const id = useId()
    const errors = validateSet(set, props.fields)
    const menuId = `${id}-set-menu`

    const chooseType = (setType: SetType) => {
        props.onSetTypeChange(props.exKey, set.key, setType)
        setOpenSetMenu(null)
    }

    const removeSet = () => {
        setOpenSetMenu(null)
        props.onRemoveSet(props.exKey, set.key)
    }

    return(
        <div className="flex items-start gap-2">
            <SetTypeMenu
            id={menuId}
            label={props.label}
            currentSetType={set.setType}
            isOpen={isMenuOpen}
            toggleSetMenu={()=>setOpenSetMenu(isMenuOpen? null :set.key)}
            onChangeSetType={chooseType}
            onRemoveSet={removeSet}
            />
            {props.fields.map((field)=>(
                <SetValueInput
                key={field.key}
                inputId={`${id}-${field.key}`}
                field={field}
                labelText={`Set ${props.label} ${field.key}`}
                placeholder="–"
                value={set[field.key]}
                error={errors[field.key]}
                onChange={(value)=> props.onFieldChange(props.exKey, set.key, field.key, value)}
                />
            ))}
        </div>
    )
}
