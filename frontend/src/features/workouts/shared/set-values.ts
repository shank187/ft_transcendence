export type FieldKey = "weight" | "reps" | "duration" | "distance"

// The profile's unit choice. The database always stores kg and meters; only the boxes convert.
export type UnitSystem = "METRIC" | "IMPERIAL"

export const FIELD_KEYS: FieldKey[] = ["weight", "reps", "duration", "distance"]

type PlannedKey = "plannedWeight" | "plannedReps" | "plannedDuration" | "plannedDistance"
type TargetKey = "targetWeight" | "targetReps" | "targetDuration" | "targetDistance"

export interface FieldDef {
    // Column title; EXERCISE_FIELDS adds the + and − signs.
    label: string
    planned: PlannedKey
    target: TargetKey
    format: (stored: number | null) => string
    parse: (text: string) => number | null
    // Same rule and message as backend/src/lib/validation.ts.
    isValid: (stored: number) => boolean
    message: string
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

// "" is no value (null), never 0. Bad text gives NaN, which every isValid rejects.
function parsePlain(text: string): number | null
{
    if (text.trim() === "") return null
    return isPlainNumber(text) ? Number(text) : NaN
}

// Stored as seconds. 90 -> "1:30" under an hour, 3750 -> "1:02:30" after.
export function formatDuration(seconds: number | null): string
{
    if (seconds === null) return ""
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor(seconds / 60) % 60
    const secs = String(seconds % 60).padStart(2, "0")
    return hours > 0
        ? `${hours}:${String(minutes).padStart(2, "0")}:${secs}`
        : `${minutes}:${secs}`
}

// Takes "90", "1:30" or "1:02:30".
export function parseDuration(text: string): number | null
{
    const value = text.trim()
    if (value === "") return null
    if (/^\d+$/.test(value)) return Number(value)
    const [a, b, c] = value.split(":").map(Number)
    if (/^\d+:[0-5]\d$/.test(value)) return a * 60 + b
    if (/^\d+:[0-5]\d:[0-5]\d$/.test(value)) return a * 3600 + b * 60 + c
    return NaN
}

// Stored as meters, shown as km.
function formatDistance(meters: number | null): string
{
    return meters === null ? "" : toText(meters / 1000)
}

// Rounded to 0.1 m so 1.1 km is 1100, not 1100.0000000000002.
function parseDistance(text: string): number | null
{
    if (text.trim() === "") return null
    if (!isPlainNumber(text)) return NaN
    return Math.round(Number(text) * 10000) / 10
}

export const KG_PER_LB = 0.45359237
const METERS_PER_MILE = 1609.344

// Stored as kg, shown as lb rounded to 0.1, so 135 lb (saved as 61.23 kg) shows 135 again.
function formatPounds(kg: number | null): string
{
    return kg === null ? "" : toText(Math.round(kg / KG_PER_LB * 10) / 10)
}

// Rounded to 0.01 kg, the precision the backend accepts.
function parsePounds(text: string): number | null
{
    if (text.trim() === "") return null
    if (!isPlainNumber(text)) return NaN
    return Math.round(Number(text) * KG_PER_LB * 100) / 100
}

// Stored as meters, shown as miles.
function formatMiles(meters: number | null): string
{
    return meters === null ? "" : toText(Math.round(meters / METERS_PER_MILE * 10000) / 10000)
}

// Rounded to 0.1 m, like parseDistance.
function parseMiles(text: string): number | null
{
    if (text.trim() === "") return null
    if (!isPlainNumber(text)) return NaN
    return Math.round(Number(text) * METERS_PER_MILE * 10) / 10
}

export const FIELDS: Record<FieldKey, FieldDef> = {
    weight: {
        label: "KG", planned: "plannedWeight", target: "targetWeight",
        format: toText, parse: parsePlain,
        isValid: v => isDecimalBetween(v, 0, 1000, 2),
        message: "Weight must be between 0 and 1000 kg.",
    },
    reps: {
        label: "REPS", planned: "plannedReps", target: "targetReps",
        format: toText, parse: parsePlain,
        isValid: v => isWholeBetween(v, 1, 999),
        message: "Reps must be a whole number between 1 and 999.",
    },
    duration: {
        label: "TIME", planned: "plannedDuration", target: "targetDuration",
        format: formatDuration, parse: parseDuration,
        isValid: v => isWholeBetween(v, 1, 86400),
        message: "Time must be like 90, 1:30 or 1:02:30, up to 24:00:00.",
    },
    distance: {
        label: "KM", planned: "plannedDistance", target: "targetDistance",
        format: formatDistance, parse: parseDistance,
        isValid: v => v > 0 && isDecimalBetween(v, 0, 1000000, 1),
        message: "Distance must be between 0 and 1000 km, up to 4 decimals.",
    },
}

// isValid still checks the stored kg and meters, so the limits match the backend in both units.
export const FIELDS_BY_UNIT: Record<UnitSystem, Record<FieldKey, FieldDef>> = {
    METRIC: FIELDS,
    IMPERIAL: {
        ...FIELDS,
        weight: { ...FIELDS.weight, label: "LB", format: formatPounds, parse: parsePounds, message: "Weight must be between 0 and 2204.6 lb." },
        distance: { ...FIELDS.distance, label: "MI", format: formatMiles, parse: parseMiles, message: "Distance must be between 0 and 621 mi." },
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
export function fieldError(key: FieldKey, text: string, units: UnitSystem): string | undefined
{
    const field = FIELDS_BY_UNIT[units][key]
    const value = field.parse(text)
    if (value !== null && !field.isValid(value))
        return field.message
    return undefined
}

// Only reads the value fields, so the day editor rows and the workout rows both use it.
export function validateSet(text: Record<FieldKey, string>, fields: { key: FieldKey }[], units: UnitSystem): Partial<Record<FieldKey, string>>
{
    const errors: Partial<Record<FieldKey, string>> = {}
    for (const { key } of fields) {
        const error = fieldError(key, text[key], units)
        if (error)
            errors[key] = error
    }
    return errors
}
