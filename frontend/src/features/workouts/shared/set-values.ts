import type { FieldKey, SetField } from "./exercise-fields";

export function toNumber(value: string): number | null
{
    return value.trim() === "" ? null : Number(value)
}

export function isWholeBetween(value: number, min: number, max: number): boolean
{
    return Number.isInteger(value) && value >= min && value <= max
}

function isDecimalBetween(value: number, min: number, max: number, decimals: number): boolean
{
    return Number.isFinite(value) && value >= min && value <= max
        && Number(value.toFixed(decimals)) === value
}

// Same rules and messages as validateSet in day-editor.api.ts.
const FIELD_RULES: Record<FieldKey, { isValid: (value: number) => boolean, message: string }> = {
    weight: { isValid: v => isDecimalBetween(v, 0, 1000, 2), message: "Weight must be between 0 and 1000 kg." },
    reps: { isValid: v => isWholeBetween(v, 1, 999), message: "Reps must be a whole number between 1 and 999." },
    duration: { isValid: v => isWholeBetween(v, 1, 86400), message: "Time must be a whole number of seconds, 1 to 86400." },
    distance: { isValid: v => v > 0 && isDecimalBetween(v, 0, 1000000, 1), message: "Distance must be between 0 and 1000000 m." },
}

// Number() also accepts "1e2" or "0x10", so only plain digits with an optional decimal part are allowed
const PLAIN_NUMBER = /^\d+(\.\d+)?$/

export function isPlainNumber(value: string): boolean
{
    return PLAIN_NUMBER.test(value.trim())
}

// Only reads the four value fields, so the session rows can reuse it.
export function validateSet(set: Record<FieldKey, string>, fields: SetField[]): Partial<Record<FieldKey, string>>
{
    const errors: Partial<Record<FieldKey, string>> = {}
    for (const field of fields) {
        const value = toNumber(set[field.key])
        if (value !== null && (!isPlainNumber(set[field.key]) || !FIELD_RULES[field.key].isValid(value)))
            errors[field.key] = FIELD_RULES[field.key].message
    }
    return errors
}
