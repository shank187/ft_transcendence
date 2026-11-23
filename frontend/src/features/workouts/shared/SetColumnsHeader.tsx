import { columnLabel, type SetField } from "./exercise-fields"
import { useUnitSystem } from "./use-unit-system"

interface SetColumnsHeaderProps {
    fields: SetField[]
    // The workout's tick column.
    withDone?: boolean
}

// Hidden from screen readers: each input has its own label.
// Same widths as the set rows: SET and DONE w-11, each value column flex-1.
export default function SetColumnsHeader(props: SetColumnsHeaderProps)
{
    const units = useUnitSystem()

    return (
        <div className="flex gap-2 text-[11px] font-semibold tracking-wider text-app-text-muted" aria-hidden="true">
            <span className="w-11 shrink-0 text-center">SET</span>
            {props.fields.map(field => (
                <span key={field.key} className="min-w-0 flex-1 text-center">{columnLabel(field, units)}</span>
            ))}
            {props.withDone && <span className="w-11 shrink-0 text-center">DONE</span>}
        </div>
    )
}
