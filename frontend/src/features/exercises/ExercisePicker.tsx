import { useCallback, useEffect, useRef, useState } from "react"
import type { Exercise, ExerciseFilters, ExerciseQuery } from "./exercise.types"
import { getExerciseFilter, getExercises } from "./exercise.api"
import LoadingState from "../../components/states/LoadingState"
import ErrorState from "../../components/states/ErrorState"
import EmptyState from "../../components/states/EmptyState"
import Button from "../../components/ui/Button"
import FilterSelect from "../../components/ui/FilterSelect"

type PageStateType =
        {status: "loading"}  
        | {status: "error" , message: string}
        |{status: "success"}

const PAGE_SIZE = 12
const INITIAL_QUERY: ExerciseQuery = {
    page: 1,
    limit: PAGE_SIZE,
    search: "",
    muscle: "",
    equipment: ""
}

const cleanQuery = (q: ExerciseQuery):ExerciseQuery =>({
    ...q,
    search: q.search?.trim() === "" ? undefined: q.search,
    equipment: q.equipment?.trim() === "" ? undefined : q.equipment,
    muscle: q.muscle?.trim() === "" ? undefined : q.muscle,
})

type PickerView = "loading" | "error" | "empty" | "list"

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

    const [filters, setFilters] = useState<ExerciseFilters|null>(null)
    const [filterState, setFilterState] = useState<PageStateType>({status: "loading"})



    const load = useCallback(async (q: ExerciseQuery)=>{
        req_id.current += 1
        const check = req_id.current;
        setPageState({status:"loading"});
        try{
            const resp = await getExercises(cleanQuery(q))
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
        const loadFilters = async ()=>{
            setFilterState({status: "loading"})
            try {
                const resp = await getExerciseFilter()
                setFilters(resp);
                setFilterState({status: "success"})
            } catch (err) {
                setFilterState({
                    status: "error",
                    message: err instanceof Error ? err.message : "Failed to Load Filters"
                })            
            }            
        }
        void loadFilters();
    }
    ,[])

    useEffect(()=>{
        void load(query)
    }, [load, query])

    useEffect(()=>{
        const id = setTimeout(()=>{
            setQuery((prev)=>(prev.search?.trim() !== searchText.trim() ? {...prev, page: 1, search: searchText} : prev))
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

    const view: PickerView =
        isLoading && query.page === 1 ? "loading"
        : isError && query.page === 1 ? "error"
        : isEmpty ? "empty"
        : "list"
    const errorMessage = pageState.status === "error" ? pageState.message : ""
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
                <div className="flex gap-3 justify-evenly">
                    <FilterSelect 
                    id = "equipment-filter"
                    label="Equipment"
                    disabled={filterState.status !== "success"}
                    value={query.equipment ?? ""}
                    options= {filters?.equipment ?? []}
                    onChange={(value) => setQuery((prev) => ({...prev, page: 1, equipment: value}))}
                    allLabel="All equipment"
                    />
                    <FilterSelect
                    id="muscle-filter"
                    label="Muscle"
                    disabled= {filterState.status !== "success"}
                    value= {query.muscle ?? ""}
                    options={filters?.muscles ?? []}
                    onChange={(value) => setQuery((prev)=>({...prev, page: 1, muscle: value}))}
                    allLabel="All muscles"
                    />
                </div>
            </div>
            {view === "loading" && <LoadingState message="Loading exercises..."/>}

            {view === "error" && <ErrorState message={errorMessage} action={RetryButton}/>}

            {view === "empty" &&
                <EmptyState
                    title="No exercise match."
                    action={
                        <Button
                            variant="secondary"
                            className="border border-app-border"
                            onClick={()=>{setSearchText(""); setQuery(INITIAL_QUERY)}}
                        >
                            Back to Default
                        </Button>
                    }
                />
            }

            {view === "list" &&
                <>
                    <p>{`showed ${page.items.length} items of ${page.total}`}</p>
                    <ul className="flex flex-col gap-y-4">
                        {page.items.map((exercise)=><li key={exercise.id}>
                            <button className="border">{exercise.name} - {exercise.primaryMuscle}</button>
                        </li>)}
                    </ul>
                    {isError && <p className="text-app-danger">{errorMessage}</p>}
                    {isError && RetryButton}
                    {hasMore && !isError &&
                        <Button onClick={loadMore} variant="secondary" disabled={isLoading}>
                            {isLoading ? "Loading..." : "Load more"}
                        </Button>
                    }
                </>
            }
        </div>
    )
}