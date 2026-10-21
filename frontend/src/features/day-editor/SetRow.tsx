import { useEffect, useId, useRef } from "react"
import type { DraftSet, SetType } from "./day-editor.types"
import { validateSet } from "./day-editor.draft"
import { SET_TYPE_LABEL, type FieldKey, type SetField } from "./exercise-fields"

const SET_TYPES: SetType[] = ["NORMAL", "WARMUP", "DROP", "FAILURE"]

const SET_TYPE_CLASSES: Record<SetType, string> = {
    NORMAL: "border-app-border bg-app-surface-hover text-app-text",
    WARMUP: "border-app-set-warmup/60 bg-app-set-warmup/10 text-app-set-warmup",
    DROP: "border-app-set-drop/60 bg-app-set-drop/10 text-app-set-drop",
    FAILURE: "border-app-set-failure/60 bg-app-set-failure/10 text-app-set-failure",
}

const SET_TYPE_DOT: Record<SetType, string> = {
    NORMAL: "bg-app-text-muted",
    WARMUP: "bg-app-set-warmup",
    DROP: "bg-app-set-drop",
    FAILURE: "bg-app-set-failure",
}

const menuItemClasses = "flex min-h-11 w-full items-center justify-between gap-3 rounded-sm px-3 text-left text-sm font-medium hover:bg-app-surface-hover focus-visible:bg-app-surface-hover"

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

    const menuWrapper = useRef<HTMLDivElement>(null)
    const setButton = useRef<HTMLButtonElement>(null)

    // when open, focus the current type and close on Esc or a press outside the menu
    useEffect(() => {
        if (!isMenuOpen) return

        menuWrapper.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus()

        const closeOnOutsidePress = (event: PointerEvent) => {
            const wrapper = menuWrapper.current
            if (wrapper && !wrapper.contains(event.target as Node))
                setOpenSetMenu(null)
        }
        const closeOnEscape = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                setOpenSetMenu(null)
                setButton.current?.focus()
            }
        }

        document.addEventListener("pointerdown", closeOnOutsidePress)
        document.addEventListener("keydown", closeOnEscape)

        return () => {
            document.removeEventListener("pointerdown", closeOnOutsidePress)
            document.removeEventListener("keydown", closeOnEscape)
        }
    }, [isMenuOpen, setOpenSetMenu])

    const chooseType = (setType: SetType) => {
        props.onSetTypeChange(props.exKey, set.key, setType)
        setOpenSetMenu(null)
        setButton.current?.focus()
    }

    const removeSet = () => {
        setOpenSetMenu(null)
        props.onRemoveSet(props.exKey, set.key)
    }

    // role="menu" expects arrow keys, Home and End to move between items
    const moveMenuFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
        const items = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]'))
        const current = items.indexOf(document.activeElement as HTMLButtonElement)
        let next: number
        if (event.key === "ArrowDown") next = (current + 1) % items.length
        else if (event.key === "ArrowUp") next = (current - 1 + items.length) % items.length
        else if (event.key === "Home") next = 0
        else if (event.key === "End") next = items.length - 1
        else return
        event.preventDefault()
        items[next].focus()
    }

    return(
        <div className="flex items-start gap-2">
            <div ref={menuWrapper} className="relative shrink-0">
                <button
                ref={setButton}
                type="button"
                aria-label={`Set ${props.label}, type ${SET_TYPE_LABEL[set.setType]}. Change type or remove`}
                aria-haspopup="menu"
                aria-expanded={isMenuOpen}
                aria-controls={isMenuOpen ? menuId : undefined}
                onClick={() => setOpenSetMenu(isMenuOpen ? null : set.key)}
                className={`flex size-11 items-center justify-center rounded-md border text-sm font-medium hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-50 ${SET_TYPE_CLASSES[set.setType]}`}
                >
                    {props.label}
                </button>
                {isMenuOpen &&
                    <div
                    id={menuId}
                    role="menu"
                    aria-label={`Set ${props.label}`}
                    onKeyDown={moveMenuFocus}
                    className="absolute left-0 top-full z-10 mt-1 flex w-44 flex-col rounded-md border border-app-border bg-app-surface-raised p-1"
                    >
                        {SET_TYPES.map(type => (
                            <button
                            key={type}
                            type="button"
                            role="menuitemradio"
                            aria-checked={set.setType === type}
                            onClick={() => chooseType(type)}
                            className={menuItemClasses}
                            >
                                <span className="flex items-center gap-2">
                                    <span aria-hidden="true" className={`size-2 rounded-full ${SET_TYPE_DOT[type]}`} />
                                    {SET_TYPE_LABEL[type]}
                                </span>
                                {set.setType === type && <span aria-hidden="true" className="text-app-primary">✓</span>}
                            </button>
                        ))}
                        <div role="separator" className="my-1 h-px bg-app-border" />
                        <button type="button" role="menuitem" onClick={removeSet} className={`${menuItemClasses} text-app-danger`}>
                            Remove set
                        </button>
                    </div>
                }
            </div>
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
