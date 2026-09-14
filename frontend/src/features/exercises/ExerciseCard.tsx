import Card from '../../components/ui/Card'
import type { Exercise } from './exercise.types'


interface ExerciseCardProps
{
    exercise: Exercise
}

function ExerciseCard(props: ExerciseCardProps)
{
    return(
        <article>
            <Card className="space-y-2">
                <h2 className="text-lg font-semibold">
                    {props.exercise.name}
                </h2>

                <p className="text-app-text-secondary">
                    {props.exercise.type}
                </p>

                <p>
                    Primary: {props.exercise.primaryMuscle}
                </p>

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
            </Card>
        </article>
    )
}

export default ExerciseCard