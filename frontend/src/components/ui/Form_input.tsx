type FormInputProps = {
    id: string;
    label: string;
    type: "email" | "password" | "text";
    value: string;
    onChange: (value: string) => void;
};

function Form_input({ id, label, type, value, onChange }: FormInputProps) {
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
                className="w-full rounded-2xl border border-gray-300 px-4 py-4 text-gray-900 placeholder:text-gray-500 focus:border-gray-600 focus:outline-none"
                required
            />
        </div>
    );
}

export default Form_input;