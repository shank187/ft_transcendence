import type { DayExercise, DraftExercise, DraftSet } from "./day-editor.types";



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
