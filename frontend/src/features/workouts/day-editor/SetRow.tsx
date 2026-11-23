import { useId, type Dispatch } from "react"
import type { DraftSet } from "./day-editor.types"
import type { SetType } from "../shared/workouts.types"
import { validateSet } from "../shared/set-values"
import type { SetField } from "../shared/exercise-fields"
import SetTypeMenu from "../shared/SetTypeMenu"
import SetValueInput from "../shared/SetValueInput"
import { useUnitSystem } from "../shared/use-unit-system"
import type { DraftAction } from "./day-editor.draft"

interface SetRowProps {
    label: string
    set: DraftSet
    fields: SetField[]
    exKey: string
    dispatch: Dispatch<DraftAction>
    isMenuOpen: boolean
    setOpenSetMenu: (setKey: string | null) => void
}

export default function SetRow(props: SetRowProps)
{
    const {set, isMenuOpen, setOpenSetMenu, exKey, dispatch} = props
    const id = useId()
    const units = useUnitSystem()
    const errors = validateSet(set, props.fields, units)
    const menuId = `${id}-set-menu`

    const chooseType = (setType: SetType) => {
        dispatch({ type: "setTypeChanged", exKey, setKey: set.key, setType })
        setOpenSetMenu(null)
    }

    const removeSet = () => {
        setOpenSetMenu(null)
        dispatch({ type: "setRemoved", exKey, setKey: set.key })
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
                placeholder="—"
                value={set[field.key]}
                error={errors[field.key]}
                onChange={(value)=> dispatch({ type: "setFieldChanged", exKey, setKey: set.key, field: field.key, value })}
                />
            ))}
        </div>
    )
}
