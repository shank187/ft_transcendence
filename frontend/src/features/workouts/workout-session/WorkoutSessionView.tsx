import { useCallback, useEffect, useMemo, useReducer, useState } from "react"
import type { PerformedValues } from "./workout-session.types";
import type { AwardResult, SetType } from "../shared/workouts.types";
import { addExercises, addSet, deleteSet, finishWorkout, getWorkoutSession, moveExercise, updateSessionSet } from "./workout-session.api";
import { livePrSetIds } from "./workout-session.helpers";
import { sessionReducer } from "./workout-session.reducer";
import { IDLE, WorkoutSessionContext, type RequestStatus, type WorkoutSessionActions } from "./WorkoutSessionContext";
import LoadingState from "../../../components/states/LoadingState";
import NotFoundState from "../../../components/states/NotFoundState";
import ErrorState from "../../../components/states/ErrorState";
import Button from "../../../components/ui/Button";
import ExerciseSessionCard from "./ExerciseSessionCard";
import SessionHeader from "./SessionHeader";
import DiscardWorkoutDialog from "./DiscardWorkoutDialog";
import FinishingDialog from "./FinishingDialog";
import type { ExerciseItem } from "../shared/exercise-picker/exercise.types";
import { ExercisePicker } from "../shared/exercise-picker/ExercisePicker";
import Dialog from "../../../components/ui/Dialog";
import SessionSummaryCard from "./SessionSummaryCard";
import { MAX_EXERCISES } from "../shared/limits";
import EmptyState from "../../../components/states/EmptyState";

function errorMessage(err: unknown, fallback: string): string
{
    return err instanceof Error ? err.message : fallback
}

export default function WorkoutSessionView(props: {sessionId: string})
{
    const { sessionId } = props
    const [state, dispatch] = useReducer(sessionReducer, { status: "loading" })
    const [reloadCount, setReloadCount] = useState(0)
    const [showDiscard, setShowDiscard] = useState(false);
    const [incompleteFinish, setIncompleteFinish] = useState(false)
    const [finishing, setFinishing] = useState(false)
    const [finishError, setFinishError] = useState<string|null>(null)
    // Only the finish response carries the award, so it is null after a reload.
    const [award, setAward] = useState<AwardResult | null>(null)

    const [showPicker, setShowPicker] = useState(false)
    const [addError, setAddError] = useState<string | null>(null)
    const [adding, setAdding] = useState(false)

    const [openSetMenuId, setOpenSetMenuId] = useState<string | null>(null)
    const [setMenu, setSetMenu] = useState<RequestStatus>(IDLE)
    const [addingSet, setAddingSet] = useState<RequestStatus>(IDLE)
    const [moving, setMoving] = useState<RequestStatus>(IDLE)

    // The load lives inside the effect so its cleanup can ignore an answer for an
    // older sessionId or an older reload.
    useEffect(()=>{
        let ignore = false
        const loadSession = async () => {
            try{
                const resp = await getWorkoutSession(sessionId)
                if (ignore) return
                dispatch(resp ? { type: "loaded", session: resp } : { type: "notFound" })
            }catch(err){
                if (ignore) return
                dispatch({ type: "loadFailed", message: errorMessage(err, "Session failed to load.") })
            }
        }
        void loadSession()
        return () => { ignore = true }
    }, [sessionId, reloadCount])

    const reloadSession = () => {
        dispatch({ type: "reloading" })
        setReloadCount(count => count + 1)
    }

    const addSelectedExercises = async (selected: ExerciseItem[]) => {
        setAdding(true)
        setAddError(null)
        try {
            const added = await addExercises(sessionId, selected.map(e => e.id))
            dispatch({ type: "exercisesAdded", exercises: added })
            setShowPicker(false)
        } catch (err) {
            setAddError(errorMessage(err, "Can't add exercises, try again."))
        } finally {
            setAdding(false)
        }
    }

    const finish = async () => {
        setFinishing(true)
        setFinishError(null)
        try {
            const finished = await finishWorkout(sessionId)
            setIncompleteFinish(false)
            setAward(finished.award)
            dispatch({ type: "finished", session: finished.session })
        } catch (err) {
            setFinishError(errorMessage(err, "Can't finish your workout, try again."))
        } finally {
            setFinishing(false)
        }
    }

    // useCallback keeps these stable, so the context value only changes when state does.

    // Errors are not caught here: they reach the row, which shows them next to its tick.
    // The saved set from the server replaces ours, so completedAt comes from the server.
    const completeSet = useCallback(async (exerciseId: string, setId: string, values: PerformedValues) => {
        const saved = await updateSessionSet(sessionId, setId, { ...values, completed: true })
        dispatch({ type: "setSaved", exerciseId, setId, set: saved })
    }, [sessionId])

    const uncompleteSet = useCallback(async (exerciseId: string, setId: string) => {
        const saved = await updateSessionSet(sessionId, setId, { completed: false })
        dispatch({ type: "setSaved", exerciseId, setId, set: saved })
    }, [sessionId])

    const toggleSetMenu = useCallback((setId: string) => setOpenSetMenuId(prev => prev === setId ? null : setId), [])

    // The menu closes at once and its button stays disabled until the save ends,
    // so the same set can't get a second request.
    const changeSetType = useCallback(async (exerciseId: string, setId: string, setType: SetType) => {
        setOpenSetMenuId(null)
        setSetMenu({ busyId: setId, error: null })
        try {
            const saved = await updateSessionSet(sessionId, setId, { setType })
            dispatch({ type: "setSaved", exerciseId, setId, set: saved })
            setSetMenu(IDLE)
        } catch (err) {
            setSetMenu({ busyId: null, error: { id: setId, message: errorMessage(err, "Can't change the set type, try again.") } })
        }
    }, [sessionId])

    const removeSet = useCallback(async (exerciseId: string, setId: string) => {
        setOpenSetMenuId(null)
        setSetMenu({ busyId: setId, error: null })
        try {
            await deleteSet(sessionId, setId)
            dispatch({ type: "setRemoved", exerciseId, setId })
            setSetMenu(IDLE)
        } catch (err) {
            setSetMenu({ busyId: null, error: { id: setId, message: errorMessage(err, "Can't remove the set, try again.") } })
        }
    }, [sessionId])

    const addSessionSet = useCallback(async (exerciseId: string) => {
        setAddingSet({ busyId: exerciseId, error: null })
        try {
            const added = await addSet(sessionId, exerciseId)
            dispatch({ type: "setAdded", exerciseId, set: added })
            setAddingSet(IDLE)
        } catch (err) {
            setAddingSet({ busyId: null, error: { id: exerciseId, message: errorMessage(err, "cant Add set to this exercise.") } })
        }
    }, [sessionId])

    const moveSessionExercise = useCallback(async (exerciseId: string, direction: -1 | 1) => {
        setMoving({ busyId: exerciseId, error: null })
        try {
            const ids = await moveExercise(sessionId, exerciseId, direction)
            dispatch({ type: "reordered", ids })
            setMoving(IDLE)
        } catch (err) {
            setMoving({ busyId: null, error: { id: exerciseId, message: errorMessage(err, "Can't move this exercise, try again.") } })
        }
    }, [sessionId])

    const session = state.status === "success" ? state.session : null
    const isReadOnly = session?.status !== "IN_PROGRESS"
    // In progress the badge follows the ticked sets; once finished, what the server stored wins.
    const prSetIds = useMemo(() => {
        if (!session)
            return new Set<string>()
        return session.status === "IN_PROGRESS"
            ? livePrSetIds(session.exercises)
            : new Set(session.summary?.prSetIds ?? [])
    }, [session])

    const actions = useMemo<WorkoutSessionActions>(() => ({
        isReadOnly, prSetIds,
        completeSet, uncompleteSet,
        openSetMenuId, toggleSetMenu, changeSetType, removeSet, setMenu,
        addSet: addSessionSet, addingSet,
        moveExercise: moveSessionExercise, moving,
    }), [isReadOnly, prSetIds, completeSet, uncompleteSet, openSetMenuId, toggleSetMenu, changeSetType,
        removeSet, setMenu, addSessionSet, addingSet, moveSessionExercise, moving])

    if (state.status === "loading") return <LoadingState message="Loading your session"/>
    if (state.status === "notFound") return <NotFoundState title="Session Not Found"/>
    if (state.status === "error")
        return(<ErrorState
            message={state.message}
            action={
                <Button
                    onClick={reloadSession}
                    variant="secondary"
                >
                    Retry
                </Button>
            }
        />)
    const loaded = state.session
    const sets = loaded.exercises.flatMap(e => e.sets)
    const doneCount = sets.filter(s => s.completedAt !== null).length

    const requestFinish = () =>
    doneCount < sets.length
        ? setIncompleteFinish(true)
        : void finish()

    const addExercisesButton = <Button variant="secondary" onClick={() => setShowPicker(true)}>Add exercises</Button>

    return(
        <WorkoutSessionContext.Provider value={actions}>
        <div className="flex flex-col gap-5">
            <SessionHeader
            name={loaded.name}
            startedAt={loaded.startedAt}
            finishedAt={loaded.completedAt}
            status={loaded.status}
            doneCount={doneCount}
            totalCount={sets.length}
            isReadOnly={isReadOnly}
            finishing={finishing}
            onFinish={requestFinish}
            onDiscard={() => setShowDiscard(true)}
            />
            {finishError && !incompleteFinish && <p role="alert" className="text-app-danger">{finishError}</p>}
            {loaded.status === "COMPLETED" && loaded.summary &&
                <SessionSummaryCard summary={loaded.summary} award={award}/>
            }
            {!isReadOnly && loaded.exercises.length === 0
                ? <EmptyState title="No exercises yet" action={addExercisesButton}/>
                : <ol className="flex flex-col gap-5">
                    {loaded.exercises.map((exercise, i)=>
                        <li key={exercise.id}>
                            <ExerciseSessionCard
                            exercise={exercise}
                            position={i + 1}
                            isFirst={i === 0}
                            isLast={i === loaded.exercises.length - 1}
                            />
                        </li>
                    )}
                </ol>
            }
            {!isReadOnly && loaded.exercises.length > 0 && loaded.exercises.length < MAX_EXERCISES && addExercisesButton}
            {!isReadOnly && loaded.exercises.length >= MAX_EXERCISES && <p className="text-sm text-app-text-secondary">{`A workout can have at most ${MAX_EXERCISES} exercises.`}</p>}
            {showDiscard && <DiscardWorkoutDialog onClose={()=>setShowDiscard(false)} sessionId={sessionId}/>}
            {incompleteFinish && <FinishingDialog onFinish={()=>finish()} error={finishError} saving={finishing} onClose={()=> setIncompleteFinish(false)} />}
            {showPicker &&
                <Dialog
                variant="drawer"
                title="Add exercises"
                isWorking={adding}
                showClose
                onClose={() => setShowPicker(false)}
                >
                    {addError && <p role="alert" className="text-app-danger">{addError}</p>}
                    <ExercisePicker onAdd={addSelectedExercises} />
                </Dialog>
            }
        </div>
        </WorkoutSessionContext.Provider>
    )
}
