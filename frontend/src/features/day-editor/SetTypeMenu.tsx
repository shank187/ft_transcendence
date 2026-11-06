import { useEffect, useRef } from "react"
import type { SetType } from "./day-editor.types"
import { SET_TYPE_LABEL } from "./exercise-fields"

const SET_TYPES: SetType[] = ["NORMAL", "WARMUP", "DROP", "FAILURE"]


const SET_TYPE_DOT: Record<SetType, string> = {
    NORMAL: "bg-app-text-muted",
    WARMUP: "bg-app-set-warmup",
    DROP: "bg-app-set-drop",
    FAILURE: "bg-app-set-failure",
}

const SET_TYPE_CLASSES: Record<SetType, string> = {
    NORMAL: "border-app-border bg-app-surface-hover text-app-text",
    WARMUP: "border-app-set-warmup/60 bg-app-set-warmup/10 text-app-set-warmup",
    DROP: "border-app-set-drop/60 bg-app-set-drop/10 text-app-set-drop",
    FAILURE: "border-app-set-failure/60 bg-app-set-failure/10 text-app-set-failure",
}

const menuItemClasses = "flex min-h-11 w-full items-center justify-between gap-3 rounded-sm px-3 text-left text-sm font-medium hover:bg-app-surface-hover focus-visible:bg-app-surface-hover"

export default function SetTypeMenu(props:{
    toggleSetMenu: () => void,
    onChangeSetType: (toType: SetType) => void,
    onRemoveSet: () => void,
    label: string
    id: string
    currentSetType: SetType
    isOpen: boolean
    disabled?: boolean,
}){

    const menuRef = useRef<HTMLDivElement>(null)
    const buttonRef = useRef<HTMLButtonElement>(null)
    const { disabled = false, isOpen, toggleSetMenu } = props

    // Focus only when the menu opens, not on every re-render while it is open.
    useEffect(()=>{
        if(isOpen)
            menuRef.current?.querySelector<HTMLButtonElement>('[aria-checked="true"]')?.focus()
    }, [isOpen])

    useEffect(()=>{
        if(!isOpen)
            return

        const closeOnOutsidePress = (e: PointerEvent)=>{
            if(! menuRef.current?.contains(e.target as Node))
                toggleSetMenu()
        }

        const keysClicks = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                toggleSetMenu()
                buttonRef.current?.focus()
                return
            }
            const items = Array.from(menuRef.current?.querySelectorAll<HTMLButtonElement>('[role^="menuitem"]') ?? [])
            const current = items.indexOf(document.activeElement as HTMLButtonElement)
            let next: number
            if (e.key === "ArrowDown") next = (current + 1) % items.length
            else if (e.key === "ArrowUp") next = (current - 1 + items.length) % items.length
            else if (e.key === "Home") next = 0
            else if (e.key === "End") next = items.length - 1
            else return
            e.preventDefault()
            items[next].focus()
        }
        document.addEventListener("keydown", keysClicks)
        document.addEventListener('pointerdown', closeOnOutsidePress)
        return ()=>{
            document.removeEventListener("pointerdown", closeOnOutsidePress)
            document.removeEventListener("keydown", keysClicks)
        }
    }, [isOpen, toggleSetMenu])

    return(
        <div
        ref={menuRef}
        className="relative shrink-0"
        >
            <button
            ref={buttonRef}
            type="button"
            aria-label={`Set ${props.label}, type ${SET_TYPE_LABEL[props.currentSetType]}. Change type or remove`}
            aria-haspopup="menu"
            aria-expanded={isOpen}
            aria-controls={isOpen ? props.id : undefined}
            disabled={disabled}
            onClick={toggleSetMenu}
            className={`flex size-11 items-center justify-center rounded-md border text-sm font-medium hover:brightness-125 aria-expanded:brightness-125 disabled:cursor-not-allowed disabled:opacity-50 ${SET_TYPE_CLASSES[props.currentSetType]}`}
            >
                {props.label}
            </button>
            { isOpen &&
                <div
                id={props.id}
                role="menu"
                aria-label={`Set ${props.label}`}
                className="absolute left-0 top-full z-10 mt-1 flex w-44 flex-col rounded-md border border-app-border bg-app-surface-raised p-1"
                >
                    {SET_TYPES.map((setType)=>(                
                        <button
                        type="button"
                        role="menuitemradio"
                        className={menuItemClasses}
                        aria-checked={props.currentSetType === setType}
                        onClick={()=>{
                            props.onChangeSetType(setType)
                            buttonRef.current?.focus()
                        }}
                        key={setType}
                        >
                            <span className="flex items-center gap-2">
                                <span aria-hidden={true} className={`size-2 rounded-full ${SET_TYPE_DOT[setType]}`}/>
                                {SET_TYPE_LABEL[setType]}
                            </span>
                            {props.currentSetType === setType && <span className="text-app-primary" aria-hidden={true}>✓</span>}
                        </button>
                    ))}
                    <div role="separator" className="my-1 h-px bg-app-border"/>
                    <button type="button" role="menuitem" onClick={props.onRemoveSet} className={`${menuItemClasses} text-app-danger`}>Remove set</button>
                </div>

            }
        </div>
    )
}