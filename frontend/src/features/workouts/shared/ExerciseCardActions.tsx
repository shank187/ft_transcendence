import { ArrowDown, ArrowUp, Trash2 } from "lucide-react"

interface ExerciseCardActionsProps {
    name: string
    isFirst: boolean
    isLast: boolean
    disabled?: boolean
    onMove: (direction: -1 | 1) => void
    onRemove: () => void
}

const iconButtonClasses = "flex size-11 items-center justify-center bg-app-surface-raised disabled:cursor-not-allowed disabled:text-app-text-muted/50"

// The day editor and the workout share these: up/down as one joined pair (disabled at the ends), then remove.
export default function ExerciseCardActions(props: ExerciseCardActionsProps)
{
    return (
        <div className="flex shrink-0 gap-2">
            <div role="group" aria-label={`Reorder ${props.name}`} className="flex overflow-hidden rounded-lg border border-app-border">
                <button type="button" aria-label={`Move ${props.name} up`} disabled={props.disabled || props.isFirst} onClick={() => props.onMove(-1)} className={iconButtonClasses}>
                    <ArrowUp aria-hidden="true" className="size-4.5" />
                </button>
                <button type="button" aria-label={`Move ${props.name} down`} disabled={props.disabled || props.isLast} onClick={() => props.onMove(1)} className={`${iconButtonClasses} border-l border-app-border`}>
                    <ArrowDown aria-hidden="true" className="size-4.5" />
                </button>
            </div>
            <button type="button" aria-label={`Remove ${props.name}`} title="Remove exercise" disabled={props.disabled} onClick={props.onRemove} className={`${iconButtonClasses} rounded-lg border border-app-border text-app-text-secondary hover:border-app-danger hover:text-app-danger`}>
                <Trash2 aria-hidden="true" className="size-4.5" />
            </button>
        </div>
    )
}
