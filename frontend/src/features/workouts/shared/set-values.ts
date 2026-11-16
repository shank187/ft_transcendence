export type FieldKey = "weight" | "reps" | "duration" | "distance"

export const FIELD_KEYS: FieldKey[] = ["weight", "reps", "duration", "distance"]

type PlannedKey = "plannedWeight" | "plannedReps" | "plannedDuration" | "plannedDistance"
type TargetKey = "targetWeight" | "targetReps" | "targetDuration" | "targetDistance"

export interface FieldDef {
    // Default title; the +KG and −KG overrides are in EXERCISE_FIELDS.
    label: string
    planned: PlannedKey
    target: TargetKey
    format: (stored: number | null) => string
    parse: (text: string) => number | null
    // Same rule and message as backend/src/lib/validation.ts.
    isValid: (stored: number) => boolean
    message: string
}

// "" is no value (null), never 0.
export function toNumber(text: string): number | null
{
    return text.trim() === "" ? null : Number(text)
}

export function toText(value: number | null): string
{
    return value !== null ? value.toString() : ""
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

export const FIELDS: Record<FieldKey, FieldDef> = {
    weight: {
        label: "KG", planned: "plannedWeight", target: "targetWeight",
        format: toText, parse: toNumber,
        isValid: v => isDecimalBetween(v, 0, 1000, 2),
        message: "Weight must be between 0 and 1000 kg.",
    },
    reps: {
        label: "REPS", planned: "plannedReps", target: "targetReps",
        format: toText, parse: toNumber,
        isValid: v => isWholeBetween(v, 1, 999),
        message: "Reps must be a whole number between 1 and 999.",
    },
    duration: {
        label: "SEC", planned: "plannedDuration", target: "targetDuration",
        format: toText, parse: toNumber,
        isValid: v => isWholeBetween(v, 1, 86400),
        message: "Time must be a whole number of seconds, 1 to 86400.",
    },
    distance: {
        label: "M", planned: "plannedDistance", target: "targetDistance",
        format: toText, parse: toNumber,
        isValid: v => v > 0 && isDecimalBetween(v, 0, 1000000, 1),
        message: "Distance must be between 0 and 1000000 m.",
    },
}

export function mapFields<T>(make: (key: FieldKey) => T): Record<FieldKey, T>
{
    return { weight: make("weight"), reps: make("reps"), duration: make("duration"), distance: make("distance") }
}

// Number() also accepts "1e2" or "0x10", so only plain digits with an optional decimal part are allowed
const PLAIN_NUMBER = /^\d+(\.\d+)?$/

export function isPlainNumber(value: string): boolean
{
    return PLAIN_NUMBER.test(value.trim())
}

// An empty box is valid: every value is optional.
export function fieldError(key: FieldKey, text: string): string | undefined
{
    const value = FIELDS[key].parse(text)
    if (value !== null && (!isPlainNumber(text) || !FIELDS[key].isValid(value)))
        return FIELDS[key].message
    return undefined
}

// Only reads the value fields, so the day editor rows and the workout rows both use it.
export function validateSet(text: Record<FieldKey, string>, fields: { key: FieldKey }[]): Partial<Record<FieldKey, string>>
{
    const errors: Partial<Record<FieldKey, string>> = {}
    for (const { key } of fields) {
        const error = fieldError(key, text[key])
        if (error)
            errors[key] = error
    }
    return errors
}
