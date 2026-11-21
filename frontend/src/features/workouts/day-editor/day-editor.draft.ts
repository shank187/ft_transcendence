import type { ExerciseItem } from "../shared/exercise-picker/exercise.types";
import type { DayExercise, DraftExercise, DraftSet, SaveDayBody, SetTargets } from "./day-editor.types";
import type { SetType } from "../shared/workouts.types";
import { EXERCISE_FIELDS } from "../shared/exercise-fields";
import { FIELD_KEYS, FIELDS, mapFields, validateSet, type FieldKey } from "../shared/set-values";

export type DraftAction =
    | { type: "reset", exercises: DayExercise[] }
    | { type: "exercisesAdded", selected: ExerciseItem[] }
    | { type: "exerciseMoved", exKey: string, direction: 1 | -1 }
    | { type: "exerciseRemoved", exKey: string }
    | { type: "setAdded", exKey: string }
    | { type: "setRemoved", exKey: string, setKey: string }
    | { type: "setFieldChanged", exKey: string, setKey: string, field: FieldKey, value: string }
    | { type: "setTypeChanged", exKey: string, setKey: string, setType: SetType }

export function draftReducer(draft: DraftExercise[], action: DraftAction): DraftExercise[]
{
    switch (action.type) {
        case "reset":
            return toDraft(action.exercises)
        case "exercisesAdded":
            return appendExercises(draft, action.selected)
        case "exerciseMoved":
            return moveExercise(draft, action.exKey, action.direction)
        case "exerciseRemoved":
            return draft.filter(e => e.key !== action.exKey)
        case "setAdded":
            return updateDraftExercise(draft, action.exKey, e => ({ ...e, sets: [...e.sets, newDraftSet()] }))
        case "setRemoved":
            return updateDraftExercise(draft, action.exKey, e => ({ ...e, sets: e.sets.filter(s => s.key !== action.setKey) }))
        case "setFieldChanged":
            return updateDraftSet(draft, action.exKey, action.setKey, s => ({ ...s, [action.field]: action.value }))
        case "setTypeChanged":
            return updateDraftSet(draft, action.exKey, action.setKey, s => ({ ...s, setType: action.setType }))
    }
}

function moveExercise(draft: DraftExercise[], key: string, direction: 1 | -1) : DraftExercise[]
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

function newDraftSet(): DraftSet {
    return { key: crypto.randomUUID(), setType: "NORMAL", ...mapFields(() => "") }
}

// Only the changed exercise and set get new objects; the others keep their reference.
function updateDraftExercise(draft: DraftExercise[], exKey: string, change: (exercise: DraftExercise) => DraftExercise): DraftExercise[]
{
    return draft.map(e => e.key !== exKey ? e : change(e))
}

function updateDraftSet(draft: DraftExercise[], exKey: string, setKey: string, change: (set: DraftSet) => DraftSet): DraftExercise[]
{
    return updateDraftExercise(draft, exKey, e => ({ ...e, sets: e.sets.map(s => s.key !== setKey ? s : change(s)) }))
}

export function toDraft(exercises: DayExercise[]): DraftExercise[]
{
    return exercises.map(exercise => ({
        key: exercise.id,
        exerciseSummary: exercise.exerciseSummary,
        sets: exercise.sets.map<DraftSet>(set => ({
            key: set.id,
            setType: set.setType,
            ...mapFields(key => FIELDS[key].format(set[FIELDS[key].target])),
        })),
    }))
}

// Each added row gets a new key: the same exercise can be added twice.
function appendExercises(draft: DraftExercise[], selected: ExerciseItem[]): DraftExercise[]
{
    const added = selected.map<DraftExercise>((e)=>({
        key: crypto.randomUUID(),
        exerciseSummary: { id: e.id, name: e.name, type: e.type, primaryMuscle: e.primaryMuscle, imageUrl: e.imageUrl },
        sets: [newDraftSet()],
    }))
    return [...draft, ...added]
}

export function isDraftValid(draft: DraftExercise[]): boolean
{
    return draft.every(e => e.sets.every(s =>
        Object.keys(validateSet(s, EXERCISE_FIELDS[e.exerciseSummary.type])).length === 0))
}

function toTargets(set: DraftSet): SetTargets
{
    const targets = { setType: set.setType } as SetTargets
    for (const key of FIELD_KEYS)
        targets[FIELDS[key].target] = FIELDS[key].parse(set[key])
    return targets
}

export function toSaveBody(draft: DraftExercise[]): SaveDayBody
{
    return {
        exercises: draft.map(e => ({
            exerciseId: e.exerciseSummary.id,
            sets: e.sets.map(toTargets),
        })),
    }
}
