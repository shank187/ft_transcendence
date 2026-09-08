import { useEffect, useState } from 'react'
import { getExercises } from './exercise.api'
import type {Exercise}  from './exercise.types'
import ExerciseCard from "./ExerciseCard"

function ExerciseCatalog() {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const loadExercises = async () => {
            try {
                const data = await getExercises()
                setExercises(data)
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load exercises')
            } finally {
                setLoading(false)
            }
        }

        void loadExercises()
    }, [])
    if(loading)
        return(
            <section>
                <h1>Loading Exercises...</h1>
            </section>
        )
    else if (error)
        return(
            <section>
                <h1>{error}</h1>
            </section>
        )
    else if (exercises.length === 0)
        return(
            <section>
                <h1>No Exercises Found.</h1>
            </section>
        )
    return (
        <section>
        <h1>Exercises Count: {exercises.length}</h1>
        <ul>
            {exercises.map(exercise => {
                return (
                    <ExerciseCard
                    key = {exercise.id}
                    exercise= {exercise}
                    />
                )
            })}
        </ul>
        </section>
    )
}

export default ExerciseCatalog