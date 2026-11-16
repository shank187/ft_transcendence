import type { ExerciseItem } from "../shared/exercise-picker/exercise.types";
import type { DayExercise, DraftExercise, DraftSet, SaveDayBody } from "./day-editor.types";
import type { SetType } from "../shared/workouts.types";
import { EXERCISE_FIELDS, type FieldKey } from "../shared/exercise-fields";
import { isPlainNumber, isWholeBetween, toNumber, validateSet } from "../shared/set-values";


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
