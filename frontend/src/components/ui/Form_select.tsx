type FormSelectProps = {
    id: string;
    label: string;
    value: string;
    options: string[];
    onChange: (value: string) => void;
};

function Form_select({id, label, value, options, onChange}: FormSelectProps) {
    return (
        <div>
            <label htmlFor={id} className="mb-2 block text-sm text-app-text-secondary">
                {label}
            </label>

            <select
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-2xl border border-app-border bg-app-surface px-4 py-4 text-app-text focus:border-app-text-secondary focus:outline-none"
            >
                <option value="">Select an option</option>

                {options.map((option) => (
                    <option key={option} value={option}>
                        {option.replaceAll('_', ' ')}
                    </option>
                ))}
            </select>
        </div>
    );
}

export default Form_select;