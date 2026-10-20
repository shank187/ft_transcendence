import { useCallback, useEffect, useRef, useState } from "react"
import type { Exercise, ExerciseQuery } from "./exercise.types"
import { getExercises } from "./exercise.api"
import LoadingState from "../../components/states/LoadingState"
import ErrorState from "../../components/states/ErrorState"
import EmptyState from "../../components/states/EmptyState"
import Button from "../../components/ui/Button"

type PageStateType =
        {status: "loading"}  
        | {status: "error" , message: string}
        |{status: "success"}

const PAGE_SIZE = 12
const INITIAL_QUERY = {
    page: 1,
    limit: PAGE_SIZE,
    search: ""
}

interface Results {
    items: Exercise[]
    total: number
}

export function ExercisePicker()
{

    const [pageState, setPageState] = useState<PageStateType>({status:"loading"})
    const [page, setPage] = useState<Results>({items:[], total:0})
    const [query, setQuery] = useState<ExerciseQuery>(INITIAL_QUERY)
    const [searchText, setSearchText] = useState("")
    const req_id = useRef(0)

    const load = useCallback(async (q: ExerciseQuery)=>{
        req_id.current += 1
        const check = req_id.current;
        setPageState({status:"loading"});
        try{
            const resp = await getExercises(q)
            if(check !== req_id.current)
                return;
            setPage((prev)=>({
                items: resp.page === 1 ? resp.items : [...prev.items, ...resp.items],
                total: resp.total
            }))
            setPageState({status: "success"});
        }catch(err){
            if(check !== req_id.current)
                return;
            setPageState({
                status: "error",
                message: err instanceof Error ? err.message : "Failed to Load Exercises"
            })
        }
    }, [])

    useEffect(()=>{
        void load(query)
    }, [load, query])

    useEffect(()=>{
        const id = setTimeout(()=>{
            setQuery((prev)=>(prev.search !== searchText ?{...prev, page: 1, search: searchText}:prev))
        },300)
        return (()=>clearTimeout(id))
    }, [searchText])

    const loadMore = () => setQuery((prev)=> ({...prev, page: prev.page + 1}) )
    const RetryButton = <Button variant="secondary" className="border border-app-border" onClick={()=>load(query)}>Retry</Button>

    const isLoading = pageState.status === "loading"
    const isError = pageState.status === "error"
    const hasLoaded = page.total !== 0
    const isEmpty = pageState.status === "success" && !hasLoaded
    const hasMore = page.total > page.items.length


    return(
        <div className="gap-3">
            <div>
                <input
                    type="search"
                    enterKeyHint="search"
                    placeholder="Search exercises"
                    aria-label="Search Exercises"
                    value={searchText}
                    onChange={(e)=>{
                        setSearchText(e.target.value)
                    }}

                />
                <div>TODO FILTERS</div>
            </div>
            {((!isError && !isEmpty) ||  (isError && query.page > 1)) && <p>{`showed ${page.items.length} items of ${page.total}`}</p>}
            {isLoading && !hasLoaded &&
                <LoadingState message="Loading exercises..."/>
            }
            {isError && query.page === 1 &&
                <ErrorState
                message={pageState.message}
                action={RetryButton}
                />
            }
            {isEmpty && !isLoading &&
                <EmptyState
                title="No exercise match."
                action= {
                            <Button
                            variant="secondary"
                            className="border border-app-border"
                            disabled={isLoading}
                            onClick={()=>{setSearchText(""); setQuery(INITIAL_QUERY)}}
                            >
                                Back to Default
                            </Button>
                        }
                />
            }
            { ((!isError && !isEmpty) ||  (isError && query.page > 1)) &&
                <ul className = "flex flex-col gap-y-4">
                    {page.items.map((exercise)=><li key={exercise.id}>
                        <button className="border">{exercise.name} - {exercise.primaryMuscle}</button>
                    </li>)}
                </ul>
            }
            {isError && query.page !== 1 && 
                <p className="text-app-danger">{pageState.message}</p>
            }
            {isError && query.page !== 1 && RetryButton}
            {hasMore && !isError &&
                <Button onClick={loadMore} variant="secondary" disabled={isLoading}>
                    {isLoading? "Loading..." : "Load more"}
                </Button>
            }
        </div>
    )
}