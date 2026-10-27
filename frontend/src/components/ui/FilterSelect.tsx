// Same shape as the API's filter options ({ id, name }), declared here so
// a shared ui component never imports from a feature folder.
import { buttonClasses } from "./button-classes"

type SelectOption = {
    id: string
    name: string
}

type FilterSelectProps = {
    id: string
    label: string
    value: string // "" means no filter
    options: SelectOption[]
    allLabel: string
    onChange: (value: string) => void
    disabled?: boolean
}

function FilterSelect({id, label, value, options, allLabel, onChange, disabled = false}: FilterSelectProps) {
    return (
        <div className="flex flex-col gap-1">
            <label className="sr-only" htmlFor={id}>{label}</label>

            {/* STYLE: pill chip, accent color when a filter is active (layer 4) */}
            <select
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                disabled={disabled}
                className = {buttonClasses("outline", "", "pill")}
                data-active={value !== ""}
            >
                <option value="">{allLabel}</option>

                {options.map((option) => (
                    <option key={option.id} value={option.id}>
                        {option.name}
                    </option>
                ))}
            </select>
        </div>
    )
}

export default FilterSelect
