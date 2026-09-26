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
            <label htmlFor={id} className="mb-2 block text-sm text-gray-700">
                {label}
            </label>

            <select
                id={id}
                value={value}
                onChange={(event) => onChange(event.target.value)}
                className="w-full rounded-2xl border border-gray-300 bg-white px-4 py-4 text-gray-900 focus:border-gray-600 focus:outline-none"
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