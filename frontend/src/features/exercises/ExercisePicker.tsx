import { useCallback, useEffect, useState } from "react"
import type { Exercise, ExerciseQuery } from "./exercise.types"
import { getExercises } from "./exercise.api"
import LoadingState from "../../components/states/LoadingState"
import ErrorState from "../../components/states/ErrorState"
import EmptyState from "../../components/states/EmptyState"
import SearchBar from "../Gyms/components/SearchBar"
import Button from "../../components/ui/Button"

type PageStateType =
        {status: "loading"}  
        | {status: "error" , message: string}
        |{status: "success"}

const PAGE_SIZE = 12
const INITIAL_QUERY = {page: 1, limit: PAGE_SIZE}

interface Results {
    items: Exercise[]
    total: number
}

export function ExercisePicker()
{

    const [pageState, setPageState] = useState<PageStateType>({status:"loading"})
    const [page, setPage] = useState<Results>({items:[], total:0})
    const [query, setQuery] = useState<ExerciseQuery>(INITIAL_QUERY)

    const load = useCallback(async (q: ExerciseQuery)=>{
        setPageState({status:"loading"});
        try{
            const resp = await getExercises(q)
            setPage((prev)=>({
                items: resp.page === 1 ? resp.items : [...prev.items, ...resp.items],
                total: resp.total
            }))
            setPageState({status: "success"});
        }catch(err){
            setPageState({
                status: "error",
                message: err instanceof Error ? err.message : "Failed to Load Exercises"
            })
        }
    }, [])

    useEffect(()=>{
        void load(query)
    }, [load, query])

    const loadMore = () => setQuery((prev)=> ({...prev, page: prev.page + 1}) )
    const RetryButton = <Button onClick={()=>load(query)}>Retry</Button>

    const isLoading = pageState.status === "loading"
    const isError = pageState.status === "error"
    const hasLoaded = page.total !== 0
    const isEmpty = pageState.status === "success" && !hasLoaded
    const hasMore = page.total > page.items.length

    if (isLoading && !hasLoaded)
        return(<LoadingState message="Loading exercises..."/>)
    if(isError && !hasLoaded)
        return(<ErrorState
            message={pageState.message}
            action={RetryButton}
        />)
    if(isEmpty)
        return(<EmptyState title="No exercise match."></EmptyState>)

    return(
        <div className="gap-3">
            <div>
                <SearchBar searchTerm="TODO : SEARCH BAR" onSearchChange={()=>{}}></SearchBar>
                <div>TODO FILTERS</div>
            </div>
            <p>{`showed ${page.items.length} items of ${page.total}`}</p>
            <ul className = "flex flex-col gap-y-4">
                {page.items.map((exercise)=><li key={exercise.id}>
                    <button className="border">{exercise.name} - {exercise.primaryMuscle}</button>
                </li>)}
            </ul>
            {isError && RetryButton}
            {hasMore && !isError &&
                <Button onClick={loadMore} variant="secondary" disabled={isLoading}>
                    {isLoading? "Loading..." : "Load more"}
                </Button>
            }
        </div>
    )
}