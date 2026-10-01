type FormInputProps = {
    id: string;
    label: string;
    type: "email" | "password" | "text" | "number";
    value: string;
    onChange: (value: string) => void;
    required?: boolean;
};

function Form_input({ id, label, type, value, onChange , required = true}: FormInputProps) {
    return (
        <div>
            <label htmlFor={id} className="sr-only">
                {label}
            </label>
            <input
                id={id}
                type={type}
                placeholder={label}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-2xl border border-app-border bg-app-surface px-4 py-4 text-app-text placeholder:text-app-text-muted focus:border-app-primary focus:outline-none"
                required={required}
            />
        </div>
    );
}

export default Form_input;