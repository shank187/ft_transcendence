import Form_input from "../ui/Form_input";

interface ProfileFieldProps {
    label: string;
    value: string;
    type?: "email" | "password" | "text" | "number";
    readOnly?: boolean;
    onChange?: (value: string) => void;
}

export default function Profile_input_field({label, value, type = "text" ,readOnly = false,onChange}: ProfileFieldProps)
{
    return (
        <div className="space-y-2">
            <div className="text-sm font-semibold">
                {label}
            </div>

           <Form_input
                id={label.toLowerCase().replaceAll(" ", "-")}
                label={label}
                type={type}
                value={value}
                readOnly={readOnly}
                onChange={onChange}
            />
        </div>
    );
}