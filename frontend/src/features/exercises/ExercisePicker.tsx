import { useCallback, useEffect, useRef, useState } from "react"
import type { Exercise, ExerciseFilters, ExerciseQuery } from "./exercise.types"
import { getExerciseFilter, getExercises } from "./exercise.api"
import LoadingState from "../../components/states/LoadingState"
import ErrorState from "../../components/states/ErrorState"
import EmptyState from "../../components/states/EmptyState"
import Button from "../../components/ui/Button"
import FilterSelect from "../../components/ui/FilterSelect"
import ExerciseRow from "./ExerciseRow"
import searchIcon from "../../assets/search-icon.svg"


type LoadStateType =
        {status: "loading"}  
        | {status: "error" , message: string}
        |{status: "success"}

const PAGE_SIZE = 12
const INITIAL_QUERY: ExerciseQuery = {
    page: 1,
    limit: PAGE_SIZE,
    search: "",
    muscle: "",
    equipment: "",
    gymId: "",
}

const cleanQuery = (q: ExerciseQuery):ExerciseQuery =>({
    ...q,
    search: q.search?.trim() === "" ? undefined: q.search,
    equipment: q.equipment?.trim() === "" ? undefined : q.equipment,
    muscle: q.muscle?.trim() === "" ? undefined : q.muscle,
    gymId: q.gymId?.trim() === "" ? undefined : q.gymId,
})

type PickerView = "loading" | "error" | "empty" | "list"

interface Results {
    items: Exercise[]
    total: number
}

export function ExercisePicker({onAdd}: {onAdd: (exercises: Exercise[]) => void})
{

    const [resultState, setResultState] = useState<LoadStateType>({status:"loading"})
    const [results, setResults] = useState<Results>({items:[], total:0})
    const [query, setQuery] = useState<ExerciseQuery>(INITIAL_QUERY)
    const [searchText, setSearchText] = useState("")
    const latestRequest = useRef(0)

    const [filters, setFilters] = useState<ExerciseFilters|null>(null)
    const [filterState, setFilterState] = useState<LoadStateType>({status: "loading"})

    const [selected, setSelected] = useState<Exercise[]>([])
    const [addGuard, setAddGuard] = useState(false)

    const toggleSelected = (selectedExercise: Exercise, isSelected: boolean)=>{   
        if(!isSelected)
            setSelected((prev)=>[...prev, selectedExercise])
        else
            setSelected((prev)=> prev.filter((exercise) => selectedExercise.id !== exercise.id))
    }
    

    const isSelected = (id: string): boolean => selected.some((exercise) => id === exercise.id)


    const load = useCallback(async (q: ExerciseQuery)=>{
        latestRequest.current += 1
        const check = latestRequest.current;
        setResultState({status:"loading"});
        try{
            const resp = await getExercises(cleanQuery(q))
            if(check !== latestRequest.current)
                return;
            setResults((prev)=>({
                items: resp.page === 1 ? resp.items : [...prev.items, ...resp.items],
                total: resp.total
            }))
            setResultState({status: "success"});
        }catch(err){
            if(check !== latestRequest.current)
                return;
            setResultState({
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

    const isLoading = resultState.status === "loading"
    const isError = resultState.status === "error"
    const hasLoaded = results.total !== 0
    const isEmpty = resultState.status === "success" && !hasLoaded
    const hasMore = results.total > results.items.length

    const view: PickerView =
        isLoading && query.page === 1 ? "loading"
        : isError && query.page === 1 ? "error"
        : isEmpty ? "empty"
        : "list"
    const errorMessage = resultState.status === "error" ? resultState.message : ""
    return(
        <div className="flex flex-col min-h-0 gap-4">
            <div className="flex flex-col gap-4">
                <div className="flex h-10 items-center gap-2 rounded-lg border border-app-border bg-app-canvas px-3">
                    <img src={searchIcon} alt="" width={18} height={18}/>
                    <input
                        type="search"
                        enterKeyHint="search"
                        placeholder="Search exercises"
                        aria-label="Search Exercises"
                        className="w-full"
                        value={searchText}
                        onChange={(e)=>{
                            setSearchText(e.target.value)
                        }}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
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
                    <Button
                        disabled={filters?.gym === null || filterState.status === "loading"}
                        variant="outline"
                        size="pill"
                        aria-pressed={query.gymId !== ""}
                        onClick={()=>setQuery((prev)=>({
                                ...prev,
                                page: 1,
                                gymId: prev.gymId === "" ? filters?.gym?.id : ""
                            }))}
                    >
                        {(filters?.gym && query.gymId !== "" ) && "✓" } {filters?.gym ? `available at ${filters?.gym.name}` : "No current gym"}
                    </Button>
                </div>
            </div>
            <div className="flex flex-1 flex-col gap-3 overflow-y-auto">
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
                        <p>{`showed ${results.items.length} items of ${results.total}`}</p>
                        <ul className="flex flex-col gap-1">
                            { results.items.map((exercise)=>
                                <li key={exercise.id}>
                                    <ExerciseRow
                                        isSelected = {isSelected(exercise.id)}
                                        onToggle={toggleSelected}
                                        exercise={exercise}
                                    />
                                </li>)
                            }
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
            <div className="flex items-center justify-between gap-3 border-t border-app-border pt-4">
                <p className="text-sm text-app-text-secondary">
                    {selected.length === 0 ? "No exercises selected" : `${selected.length} selected`}
                </p>
                {selected.length > 0 &&
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" onClick={() => setSelected([])}>Reset</Button>
                        <Button
                            onClick={() => {
                                setAddGuard(true)
                                onAdd(selected)
                            }}
                            disabled={addGuard}
                        >
                            Add {selected.length}
                        </Button>
                    </div>
                }
            </div>
        </div>
    )
}