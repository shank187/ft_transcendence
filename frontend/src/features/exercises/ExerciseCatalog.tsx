import { useCallback, useEffect, useState } from 'react'
import { getExercises } from './exercise.api'
import type { Exercise, ExerciseQuery } from './exercise.types'
import ExerciseCard from './ExerciseCard'
import Button from '../../components/ui/Button'
import LoadingState from '../../components/states/LoadingState'
import ErrorState from '../../components/states/ErrorState'
import EmptyState from '../../components/states/EmptyState'

const PAGE_SIZE = 12
const INITIAL_QUERY: ExerciseQuery = { page: 1, limit: PAGE_SIZE }

interface Results {
    items: Exercise[]
    total: number
}

type RequestState =
    | { status: 'loading' }
    | { status: 'error'; message: string }
    | { status: 'success' }

function ExerciseCatalog() {
    // what to fetch; search and filters go here too
    const [query, setQuery] = useState<ExerciseQuery>(INITIAL_QUERY)
    // what came back
    const [results, setResults] = useState<Results>({ items: [], total: 0 })
    // one status, so "loading" and "error" can't both be true
    const [request, setRequest] = useState<RequestState>({ status: 'loading' })

    const load = useCallback(async (queryToLoad: ExerciseQuery) => {
        setRequest({ status: 'loading' })
        try {
            const data = await getExercises(queryToLoad)
            // page 1 replaces the list, later pages append to it
            setResults(previous => ({
                items: queryToLoad.page === 1 ? data.items : [...previous.items, ...data.items],
                total: data.total,
            }))
            setRequest({ status: 'success' })
        } catch (err) {
            setRequest({
                status: 'error',
                message: err instanceof Error ? err.message : 'Failed to load exercises.',
            })
        }
    }, [])

    useEffect(() => {
        void load(query)
    }, [load, query])

    // retries the page that failed, keeping the cards already loaded
    const retry = () => void load(query)
    const loadMore = () => setQuery(current => ({ ...current, page: current.page + 1 }))

    const isLoading = request.status === 'loading'
    const hasLoadedItems = results.items.length > 0
    const hasMore = results.items.length < results.total

    if (isLoading && !hasLoadedItems)
        return <LoadingState message="Loading Exercises..." />

    if (request.status === 'error' && !hasLoadedItems)
        return (
            <ErrorState
                message={request.message}
                action={
                    <Button variant="secondary" onClick={retry}>
                        Retry
                    </Button>
                }
            />
        )

    if (!hasLoadedItems)
        return <EmptyState title="No exercises found." />

    return (
        <section className="space-y-4">
            <h1 className="text-2xl font-semibold">Exercises</h1>

            <div className="grid grid-cols-[repeat(auto-fit,minmax(min(100%,280px),1fr))] gap-4">
                {results.items.map(exercise => (
                    <ExerciseCard key={exercise.id} exercise={exercise} />
                ))}
            </div>

            <p className="text-app-text-secondary">
                {results.items.length} of {results.total} exercises
            </p>

            {request.status === 'error' && (
                <div className="space-y-2">
                    <p>Failed to load more exercises.</p>
                    <Button variant="secondary" onClick={retry}>
                        Retry
                    </Button>
                </div>
            )}

            {request.status !== 'error' && hasMore && (
                <Button variant="primary" onClick={loadMore} disabled={isLoading}>
                    {isLoading ? 'Loading...' : 'Load more'}
                </Button>
            )}
        </section>
    )
}

export default ExerciseCatalog
