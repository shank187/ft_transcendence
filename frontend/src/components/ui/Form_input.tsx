import { input_classes } from "./form-input-classes";

type InputVariant = "auth" | "chat" | "search";

type FormInputProps = {
    id: string;
    label: string;
    type: "email" | "password" | "text" | "number";
    value: string;
    variant?: InputVariant;
    onChange?: (value: string) => void;
    readOnly?: boolean;
    required?: boolean;
};

function Form_input({
    id,
    label,
    type,
    value,
    variant = "auth",
    onChange,
    required = true,
    readOnly = false,
}: FormInputProps) {
    return (
        <div>
            <label
                htmlFor={id}
                className={input_classes.label}
            >
                {label}
            </label>

            <input
                id={id}
                type={type}
                placeholder={label}
                value={value}
                onChange={(event) => onChange?.(event.target.value)}
                className={`${input_classes.base} ${input_classes.variant[variant]}`}
                required={required}
                readOnly={readOnly}
            />
        </div>
    );
}

export default Form_input;