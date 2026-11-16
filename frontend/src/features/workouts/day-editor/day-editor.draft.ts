import type { ExerciseItem } from "../shared/exercise-picker/exercise.types";
import type { DayExercise, DraftExercise, DraftSet, SaveDayBody } from "./day-editor.types";
import type { SetType } from "../shared/workouts.types";
import { EXERCISE_FIELDS, type FieldKey } from "../shared/exercise-fields";
import { isPlainNumber, isWholeBetween, toNumber, toText, validateSet } from "../shared/set-values";


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

// The only places that copy the nested arrays, same as updateSet in the workout:
// the changed exercise and set get new objects, every other one keeps its reference.
function updateDraftExercise(draft: DraftExercise[], exKey: string, change: (exercise: DraftExercise) => DraftExercise): DraftExercise[]
{
    return draft.map(e => e.key !== exKey ? e : change(e))
}

function updateDraftSet(draft: DraftExercise[], exKey: string, setKey: string, change: (set: DraftSet) => DraftSet): DraftExercise[]
{
    return updateDraftExercise(draft, exKey, e => ({ ...e, sets: e.sets.map(s => s.key !== setKey ? s : change(s)) }))
}

export function addDraftSet(draft: DraftExercise[], key: string): DraftExercise[]
{
    return updateDraftExercise(draft, key, e => ({ ...e, sets: [...e.sets, newDraftSet()] }))
}

export function removeDraftSet(draft: DraftExercise[], exKey: string, setKey: string): DraftExercise[]
{
    return updateDraftExercise(draft, exKey, e => ({ ...e, sets: e.sets.filter(s => s.key !== setKey) }))
}

export function updateSetField(draft: DraftExercise[], exKey: string, setKey: string, field: FieldKey, value: string): DraftExercise[]
{
    return updateDraftSet(draft, exKey, setKey, s => ({ ...s, [field]: value }))
}

export function updateSetType(draft: DraftExercise[], exKey: string, setKey: string, setType: SetType): DraftExercise[]
{
    return updateDraftSet(draft, exKey, setKey, s => ({ ...s, setType }))
}

export function updateRest(draft: DraftExercise[], exKey: string, value: string): DraftExercise[]
{
    return updateDraftExercise(draft, exKey, e => ({ ...e, restSeconds: value }))
}

export function toDraft(exercises: DayExercise[]): DraftExercise[]
{
    return exercises.map(exercise => ({
        key: exercise.id,
        restSeconds: toText(exercise.restSeconds),
        exerciseSummary: exercise.exerciseSummary,
        sets: exercise.sets.map<DraftSet>(set => ({
            key: set.id,
            setType: set.setType,
            weight: toText(set.targetWeight),
            reps: toText(set.targetReps),
            duration: toText(set.targetDuration),
            distance: toText(set.targetDistance),
        })),
    }))
}

// Each added row gets a new key: the same exercise can be added twice.
export function appendExercises(draft: DraftExercise[], selected: ExerciseItem[]): DraftExercise[]
{
    const added = selected.map<DraftExercise>((e)=>({
        key: crypto.randomUUID(),
        restSeconds: "",
        exerciseSummary: { id: e.id, name: e.name, type: e.type, primaryMuscle: e.primaryMuscle, imageUrl: e.imageUrl },
        sets: [newDraftSet()],
    }))
    return [...draft, ...added]
}

// Same rule and message as restSecondsValue in backend/src/lib/validation.ts.
export function validateRest(value: string): string | null
{
    const result = toNumber(value)
    if(result !== null && (!isPlainNumber(value) || !isWholeBetween(result, 0, 3600)))
        return "Rest must be between 0 and 3600 seconds."
    return null
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
