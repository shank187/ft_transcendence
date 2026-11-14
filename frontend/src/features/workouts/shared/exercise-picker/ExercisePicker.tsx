import { useEffect, useState } from "react"
import type { ExerciseItem, ExerciseQuery } from "./exercise.types"
import { getExerciseFilter, getExercises } from "./exercise.api"
import LoadingState from "../../../../components/states/LoadingState"
import ErrorState from "../../../../components/states/ErrorState"
import EmptyState from "../../../../components/states/EmptyState"
import Button from "../../../../components/ui/Button"
import FilterSelect from "../../../../components/ui/FilterSelect"
import ExerciseRow from "./ExerciseRow"
import { EXERCISE_SEARCH_MAX } from "../limits"
import searchIcon from "../../../../assets/search-icon.svg"
import type { ExerciseFilters } from "../../../../../../shared/exercises"

type LoadStateType =
    | {status: "loading"}
    | {status: "error", message: string}
    | {status: "success"}

const PAGE_SIZE = 12
const INITIAL_QUERY: ExerciseQuery = {
    page: 1,
    limit: PAGE_SIZE,
    search: "",
    muscle: "",
    equipment: "",
    sort: "name_asc",
    gym: false,
}

const cleanQuery = (q: ExerciseQuery):ExerciseQuery =>({
    ...q,
    search: q.search?.trim() === "" ? undefined: q.search,
    equipment: q.equipment?.trim() === "" ? undefined : q.equipment,
    muscle: q.muscle?.trim() === "" ? undefined : q.muscle,
    // Leave gym out when off, like the empty filters above.
    gym: q.gym ? true : undefined,
})

type PickerView = "loading" | "error" | "empty" | "list"

interface Results {
    items: ExerciseItem[]
    total: number
}

export function ExercisePicker({onAdd}: {onAdd: (exercises: ExerciseItem[]) => void | Promise<void>})
{
    const [resultState, setResultState] = useState<LoadStateType>({status:"loading"})
    const [results, setResults] = useState<Results>({items:[], total:0})
    const [query, setQuery] = useState<ExerciseQuery>(INITIAL_QUERY)
    const [searchText, setSearchText] = useState("")
    const [reloadCount, setReloadCount] = useState(0)

    const [filters, setFilters] = useState<ExerciseFilters|null>(null)
    const [filterState, setFilterState] = useState<LoadStateType>({status: "loading"})

    const [selected, setSelected] = useState<ExerciseItem[]>([])
    const [addGuard, setAddGuard] = useState(false)

    const toggleSelected = (selectedExercise: ExerciseItem, isSelected: boolean)=>{
        if(!isSelected)
            setSelected((prev)=>[...prev, selectedExercise])
        else
            setSelected((prev)=> prev.filter((exercise) => selectedExercise.id !== exercise.id))
    }

    const isSelected = (id: string): boolean => selected.some((exercise) => id === exercise.id)

    useEffect(()=>{
        const loadFilters = async ()=>{
            setFilterState({status: "loading"})
            try {
                const resp = await getExerciseFilter()
                setFilters(resp)
                setFilterState({status: "success"})
            } catch (err) {
                setFilterState({
                    status: "error",
                    message: err instanceof Error ? err.message : "Failed to Load Filters"
                })
            }
        }
        void loadFilters()
    }, [])

    // The cleanup marks the previous request as stale, so a slow older search
    // can't overwrite newer results.
    useEffect(()=>{
        let ignore = false
        const loadExercises = async () => {
            setResultState({status:"loading"})
            try{
                const resp = await getExercises(cleanQuery(query))
                if (ignore) return
                setResults((prev)=>({
                    items: resp.page === 1 ? resp.items : [...prev.items, ...resp.items],
                    total: resp.total
                }))
                setResultState({status: "success"})
            }catch(err){
                if (ignore) return
                setResultState({
                    status: "error",
                    message: err instanceof Error ? err.message : "Failed to Load Exercises"
                })
            }
        }
        void loadExercises()
        return () => { ignore = true }
    }, [query, reloadCount])

    useEffect(()=>{
        const id = setTimeout(()=>{
            setQuery((prev)=>(prev.search?.trim() !== searchText.trim() ? {...prev, page: 1, search: searchText} : prev))
        },300)
        return (()=>clearTimeout(id))
    }, [searchText])

    const loadMore = () => setQuery((prev)=> ({...prev, page: prev.page + 1}) )
    const RetryButton = <Button variant="secondary" className="border border-app-border" onClick={() => setReloadCount(count => count + 1)}>Retry</Button>

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
                        maxLength={EXERCISE_SEARCH_MAX}
                        className="w-full"
                        value={searchText}
                        onChange={(e)=>{
                            setSearchText(e.target.value)
                        }}
                    />
                </div>
                <div className="flex flex-wrap gap-2">
                    <FilterSelect
                        id="equipment-filter"
                        label="Equipment"
                        disabled={filterState.status !== "success"}
                        value={query.equipment ?? ""}
                        options={filters?.equipment ?? []}
                        onChange={(value) => setQuery((prev) => ({...prev, page: 1, equipment: value}))}
                        allLabel="All equipment"
                    />
                    <FilterSelect
                        id="muscle-filter"
                        label="Muscle"
                        disabled={filterState.status !== "success"}
                        value={query.muscle ?? ""}
                        options={filters?.muscles ?? []}
                        onChange={(value) => setQuery((prev)=>({...prev, page: 1, muscle: value}))}
                        allLabel="All muscles"
                    />
                    {/* "" is FilterSelect's first option, used here for the default order. */}
                    <FilterSelect
                        id="sort-select"
                        label="Sort"
                        showLabel
                        value={query.sort === "name_desc" ? "name_desc" : ""}
                        options={[{ id: "name_desc", name: "Name Z–A" }]}
                        onChange={(value) => setQuery((prev) => ({...prev, page: 1, sort: value === "name_desc" ? "name_desc" : "name_asc"}))}
                        allLabel="Name A–Z"
                    />
                    <Button
                        disabled={filterState.status !== "success" || !filters?.gym}
                        variant="outline"
                        size="pill"
                        aria-pressed={query.gym}
                        onClick={()=>setQuery((prev)=>({
                            ...prev,
                            page: 1,
                            gym: !prev.gym
                        }))}
                    >
                        {(filters?.gym && query.gym) && <span aria-hidden="true">✓</span>} {filters?.gym ? `available at ${filters?.gym.name}` : "No current gym"}
                    </Button>
                </div>
                {filterState.status === "error" && <p className="text-xs text-app-danger">Filters unavailable.</p>}
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
                            {results.items.map((exercise)=>
                                <li key={exercise.id}>
                                    <ExerciseRow
                                        isSelected={isSelected(exercise.id)}
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
                            onClick={async () => {
                                setAddGuard(true)
                                try {
                                    await onAdd(selected)
                                } finally {
                                    setAddGuard(false)
                                }
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
