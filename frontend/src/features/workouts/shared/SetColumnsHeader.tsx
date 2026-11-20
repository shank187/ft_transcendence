import type { SetField } from "./exercise-fields"

// Hidden from screen readers: each input has its own label.
export default function SetColumnsHeader(props: { fields: SetField[] })
{
    return (
        <div className="flex gap-2 text-[11px] font-medium tracking-wider text-app-text-muted" aria-hidden="true">
            <span className="w-11 shrink-0">SET</span>
            {props.fields.map(field => (
                <span key={field.key} className="w-22 shrink-0">{field.label}</span>
            ))}
        </div>
    )
}
