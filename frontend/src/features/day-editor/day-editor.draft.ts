import type { DayDetail, DayExercise, DraftExercise } from "./day-editor.types";



export function toDraft(exercises: DayExercise[]): DraftExercise[]
{
    return( exercises.map((exercise)=>(
        {
            key: exercise.id,
            restSeconds: exercise.restSeconds ? exercise.restSeconds?.toString : "",
            exerciseSummary: exercise.exerciseSummary,
            sets: 
        }
    )))
}
//todo next comlete copyin respons to our draft copy