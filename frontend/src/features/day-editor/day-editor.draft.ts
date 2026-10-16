import type { DayExercise, DraftExercise, DraftSet, SaveDayBody, SetType } from "./day-editor.types";
import { EXERCISE_FIELDS, type FieldKey, type SetField } from "./exercise-fields";


export function moveExercise(draft: DraftExercise[], key: string, direction: 1 | -1) : DraftExercise[]
{
    const index = draft.findIndex(e => e.key === key)
    const target = index + direction

    if(index === -1 || target < 0 || target >= draft.length)
        return draft

    const next = [...draft]
    const current = next[index]
    next[index] = next[target]
    next[target] = current
    return next;
}

export function removeExercise(draft: DraftExercise[], key: string): DraftExercise[]
{
    const index = draft.findIndex(e=>e.key === key)
    if(index === -1)
        return draft
    const next = draft.filter(e=>e.key !== key)
    return next
}

function newDraftSet(): DraftSet {
    return{
        key: crypto.randomUUID(),
        setType: "NORMAL",
        weight: "",
        reps: "",
        duration: "",
        distance: ""
    }
}



export function addDraftSet(draft: DraftExercise[], key: string): DraftExercise[]
{
    const index = draft.findIndex(e=>e.key === key)
    if(index === -1)
        return draft
    const newSet = newDraftSet()
    const next = draft.map<DraftExercise>((e, i)=>(i === index? {...e, sets:[...e.sets, newSet]}: e))
    return next
}

export function removeDraftSet(draft: DraftExercise[], exKey: string, setKey: string): DraftExercise[]
{
    const exIndex = draft.findIndex(e => e.key === exKey)
    if (exIndex === -1)
        return draft
    const setIndex = draft[exIndex].sets.findIndex(s => s.key === setKey)
    if (setIndex === -1)
        return draft
    return draft.map((e, i) =>(i === exIndex? {...e, sets: e.sets.filter((_, i) =>(i !== setIndex))}  :e))
}

export function updateSetField(draft: DraftExercise[], exKey: string, setKey: string, field: FieldKey, value: string): DraftExercise[]
{
    const exIndex = draft.findIndex(e => e.key === exKey)
    if (exIndex === -1)
        return draft
    const setIndex = draft[exIndex].sets.findIndex(s => s.key === setKey)
    if (setIndex === -1)
        return draft
    return draft.map((e, i) => (i === exIndex
        ? {...e, sets: e.sets.map((s, j) => (j === setIndex ? {...s, [field]: value} : s))}
        : e))
}

export function updateSetType(draft: DraftExercise[], exKey: string, setKey: string, setType: SetType): DraftExercise[]
{
    const exIndex = draft.findIndex(e => e.key === exKey)
    if (exIndex === -1)
        return draft
    const setIndex = draft[exIndex].sets.findIndex(s => s.key === setKey)
    if (setIndex === -1)
        return draft
    return draft.map((e, i) => (i === exIndex
        ? {...e, sets: e.sets.map((s, j) => (j === setIndex ? {...s, setType} : s))}
        : e))
}

export function updateRest(draft: DraftExercise[], exKey: string, value: string): DraftExercise[]{
    const exIndex = draft.findIndex(e =>e.key === exKey)
    if(exIndex === -1)
            return draft
    return draft.map((exercise, i) => (i === exIndex)?{...exercise, restSeconds: value}:exercise)
}


export function toDraft(exercises: DayExercise[]): DraftExercise[]
{
    return( exercises.map((exercise)=>(
        {
            key: exercise.id,
            restSeconds: exercise.restSeconds !== null ? exercise.restSeconds?.toString() : "",
            exerciseSummary: exercise.exerciseSummary,
            sets: exercise.sets.map<DraftSet>((set)=>(
                {
                    key: set.id,
                    setType: set.setType,
                    weight: set.targetWeight!== null ? set.targetWeight.toString() : "",
                    reps: set.targetReps !== null ? set.targetReps.toString() : "",
                    duration: set.targetDuration !== null ? set.targetDuration.toString() : "",
                    distance: set.targetDistance!== null ? set.targetDistance.toString() : "",
                }
            ))

        }
    )))
}

export function toNumber(value: string): number | null
{
    return value.trim() === "" ? null : Number(value)
}

function isWholeBetween(value: number, min: number, max: number): boolean
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

export function validateRest(value: string): string | null
{
    const result = toNumber(value)
    if(result !== null && !isWholeBetween(result, 1, 1000))
        return "Rest time should be between 1 and 1000 sec"
    return null
}
export function validateSet(set: DraftSet, fields: SetField[]): Partial<Record<FieldKey, string>>
{
    const errors: Partial<Record<FieldKey, string>> = {}
    for (const field of fields) {
        const value = toNumber(set[field.key])
        if (value !== null && !FIELD_RULES[field.key].isValid(value))
            errors[field.key] = FIELD_RULES[field.key].message
    }
    return errors
}

export function isDraftValid(draft: DraftExercise[]): boolean
{
    
    return draft.every(e => validateRest(e.restSeconds) === null  && e.sets.every(s =>
        Object.keys(validateSet(s, EXERCISE_FIELDS[e.exerciseSummary.type])).length === 0))
}

export function toSaveBody(draft: DraftExercise[]): SaveDayBody
{
    return {
        exercises: draft.map(e => ({
            exerciseId: e.exerciseSummary.id,
            restSeconds: toNumber(e.restSeconds),
            sets: e.sets.map(s => ({
                setType: s.setType,
                targetWeight: toNumber(s.weight),
                targetReps: toNumber(s.reps),
                targetDuration: toNumber(s.duration),
                targetDistance: toNumber(s.distance),
            })),
        })),
    }
}
