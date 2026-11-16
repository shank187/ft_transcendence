import { select_classes } from "./form-select-classes";

type SelectVariant =
    | "auth"
    | "workout"
    | "gym"
    | "profile";

type FormSelectProps = {
    id: string;
    label: string;
    value: string;
    options: string[];

    variant?: SelectVariant;

    onChange?: (value: string) => void;
    required?: boolean;
    disabled?: boolean;
};

function Form_select({
    id,
    label,
    value,
    options,
    variant = "auth",
    onChange,
    required = true,
    disabled = false,
}: FormSelectProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className={select_classes.label}
            >
                {label}
            </label>

            <select
                id={id}
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                className={`${select_classes.base} ${select_classes.variant[variant]}`}
                required={required}
                disabled={disabled}
            >
                <option value="" disabled className={select_classes.option}>
                    {label}
                </option>
                {options.map((option) => (
                    <option key={option} value={option} className={select_classes.option}>
                        {option}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Form_select;
