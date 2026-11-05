import {useId} from "react"
import type { DraftSet, SetType } from "./day-editor.types"
import { validateSet } from "./day-editor.draft"
import {type FieldKey, type SetField } from "./exercise-fields"
import SetTypeMenu from "./SetTypeMenu"


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
            CurrentSetType={set.setType}
            isOpen={isMenuOpen}
            toggleSetMenu={()=>setOpenSetMenu(isMenuOpen? null :set.key)}
            onChangeSetType={chooseType}
            onRemoveSet={removeSet}
            />
            {props.fields.map((field)=>(
                <div key={field.key} className="flex w-22 shrink-0 flex-col gap-1">
                    <label htmlFor={`${id}-${field.key}`} className="sr-only">
                        {`Set ${props.label} ${field.key}`}
                    </label>
                    <input
                    id={`${id}-${field.key}`}
                    type="text"
                    placeholder="–"
                    inputMode={field.key === "weight" || field.key === "distance" ? "decimal" : "numeric"}
                    className="h-11 w-full rounded-md border border-app-border bg-app-canvas text-center text-sm font-medium placeholder:text-app-text-muted aria-invalid:border-app-danger"
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
        </div>
    )
}
