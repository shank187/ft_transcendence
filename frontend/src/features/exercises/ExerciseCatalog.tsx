import { useEffect, useState } from 'react'
import { getExercises } from './exercise.api'
import type {Exercise}  from './exercise.types'
import ExerciseCard from "./ExerciseCard"

const PAGE_SIZE = 12

function ExerciseCatalog() {
    const [exercises, setExercises] = useState<Exercise[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)

    useEffect(() => {
        const loadExercises = async () => {
            setLoading(true)
            setError(null)
            try {
                const data = await getExercises(page, PAGE_SIZE)
                setTotal(data.total)
                setTotalPages(data.totalPages)
                if(page === 1){
                    setExercises(data.items)
                } else {
                    setExercises(previous => [
                        ...previous,
                        ...data.items
                    ])
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load exercises')
            } finally {
                setLoading(false)
            }
        }

        void loadExercises()
    }, [page])


    if(loading && exercises.length === 0)
        return(
            <section>
                <h1>Loading Exercises...</h1>
            </section>
        )
    if (error && exercises.length === 0)
        return(
            <section>
                <h1>{error}</h1>
                
            </section>
        )
    if (exercises.length === 0)
        return(
            <section>
                <h1>No Exercises Found.</h1>
            </section>
        )
    return (
        <section>
        <h1>Exercises</h1>
        <div>
            {exercises.map(exercise => {
                return (
                    <ExerciseCard
                    key = {exercise.id}
                    exercise= {exercise}
                    />
                )
            })}
        </div>
        <p> {exercises.length} of {total} exercises</p>

        {error && exercises.length > 0 && (
            <div>
                <p>Failed to load more exercises.</p>

                <button
                    type="button"
                    onClick={() => setPage(current => current)}
                >
                    Retry
                </button>
            </div>
        )}

        {page < totalPages && (
            <button
                onClick={() => setPage(current => current + 1)}
                disabled={loading}
            >
                {loading ? 'Loading...' : 'Load more'}
            </button>
        )}
        </section>
    )
}

export default ExerciseCatalog