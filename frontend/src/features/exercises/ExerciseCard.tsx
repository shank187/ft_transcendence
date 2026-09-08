import type { Exercise } from './exercise.types'


interface ExerciseCardProps
{
    exercise: Exercise
}

function ExerciseCard(props: ExerciseCardProps)
{
    return(
        <article>
            <h2>{props.exercise.name}</h2>
            <p>{props.exercise.type}</p>
            <p>{props.exercise.primaryMuscle}</p>
        </article>
    )
}

export default ExerciseCard