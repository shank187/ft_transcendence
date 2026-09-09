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
            <p>Primary: {props.exercise.primaryMuscle}</p>
            <p>
                Secondary: {
                    props.exercise.secondaryMuscles.length > 0
                        ? props.exercise.secondaryMuscles.join(', ')
                        : 'None'
                }
            </p>

            <p>
                Equipment: {
                    props.exercise.equipment.length > 0
                        ? props.exercise.equipment.join(', ')
                        : 'None'
                }
            </p>
    </article>
    )
}

export default ExerciseCard