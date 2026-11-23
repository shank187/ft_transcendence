import type { ExerciseItem } from "../shared/exercise-picker/exercise.types";
import type { DayExercise, DraftExercise, DraftSet, SaveDayBody, SetTargets } from "./day-editor.types";
import type { SetType } from "../shared/workouts.types";
import { EXERCISE_FIELDS } from "../shared/exercise-fields";
import { FIELD_KEYS, FIELDS_BY_UNIT, mapFields, validateSet, type FieldKey, type UnitSystem } from "../shared/set-values";

export type DraftAction =
    // units: the draft holds the text as shown, so kg or lb is chosen when it is built.
    | { type: "reset", exercises: DayExercise[], units: UnitSystem }
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
            return toDraft(action.exercises, action.units)
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

export function toDraft(exercises: DayExercise[], units: UnitSystem): DraftExercise[]
{
    const fieldDefs = FIELDS_BY_UNIT[units]
    return exercises.map(exercise => ({
        key: exercise.id,
        exerciseSummary: exercise.exerciseSummary,
        sets: exercise.sets.map<DraftSet>(set => ({
            key: set.id,
            setType: set.setType,
            ...mapFields(key => fieldDefs[key].format(set[fieldDefs[key].target])),
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

export function isDraftValid(draft: DraftExercise[], units: UnitSystem): boolean
{
    return draft.every(e => e.sets.every(s =>
        Object.keys(validateSet(s, EXERCISE_FIELDS[e.exerciseSummary.type], units)).length === 0))
}

function toTargets(set: DraftSet, units: UnitSystem): SetTargets
{
    const fieldDefs = FIELDS_BY_UNIT[units]
    const targets = { setType: set.setType } as SetTargets
    for (const key of FIELD_KEYS)
        targets[fieldDefs[key].target] = fieldDefs[key].parse(set[key])
    return targets
}

export function toSaveBody(draft: DraftExercise[], units: UnitSystem): SaveDayBody
{
    return {
        exercises: draft.map(e => ({
            exerciseId: e.exerciseSummary.id,
            sets: e.sets.map(set => toTargets(set, units)),
        })),
    }
}
