import type { DayExercise, DraftExercise, DraftSet } from "./day-editor.types";


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
