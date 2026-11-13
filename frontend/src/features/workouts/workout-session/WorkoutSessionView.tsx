import { useEffect, useState } from "react"
import type { PerformedValues } from "./workout-session.types";
import type { AwardResult, SetType, WorkoutSession } from "../shared/workouts.types";
import { addExercises, addSet, deleteSet, finishWorkout, getWorkoutSession, moveExercise, updateSessionSet } from "./workout-session.api";
import { orderExercises, updateSet } from "./workout-session.helpers";
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

type LoadStateType =
    | { status: "loading" }
    | { status: "error", message: string }
    | { status: "notFound" }
    | { status: "success", session: WorkoutSession }

export default function WorkoutSessionView(props: {sessionId: string})
{
    const { sessionId } = props
    const [loadState, setLoadState] = useState<LoadStateType>({status:"loading"});
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

    const [addSetError, setAddSetError] = useState<{ exerciseId: string, message: string } | null>(null)
    const [addingSet, setAddingSet] = useState<boolean>(false)

    const [openSetMenuId, setOpenSetMenuId] = useState<string | null>(null)
    const [setError, setSetError] = useState<{ setId: string, message: string } | null>(null)
    const [savingSetId, setSavingSetId] = useState<string | null>(null)

    const [moving, setMoving] = useState(false)
    const [moveError, setMoveError] = useState<{ id: string, message: string } | null>(null)

    const addSelectedExercises = async (selected: ExerciseItem[]) => {
        setAdding(true)
        setAddError(null)
        try {
            const added = await addExercises(sessionId, selected.map(e => e.id))
            setLoadState(prev => prev.status !== "success" ? prev : {
                ...prev,
                session: { ...prev.session, exercises: [...prev.session.exercises, ...added] },
            })
            setShowPicker(false)
        } catch (err) {
            setAddError(err instanceof Error ? err.message : "Can't add exercises, try again.")
        } finally {
            setAdding(false)
        }
    }

    const toggleSetMenu = (setId: string) => setOpenSetMenuId(prev => prev === setId ? null : setId)

    // The menu closes at once and its button stays disabled until the save ends,
    // so the same set can't get a second request.
    const changeSetType = async (exerciseId: string, setId: string, setType: SetType) => {
        setSetError(null)
        setOpenSetMenuId(null)
        setSavingSetId(setId)
        try {
            const saved = await updateSessionSet(sessionId, setId, { setType })
            setLoadState(prev => prev.status !== "success" ? prev : {
                ...prev,
                session: { ...prev.session, exercises: updateSet(prev.session.exercises, exerciseId, setId, () => saved) },
            })
        } catch (err) {
            setSetError({ setId, message: err instanceof Error ? err.message : "Can't change the set type, try again." })
        } finally {
            setSavingSetId(null)
        }
    }

    const removeSessionSet = async (exerciseId: string, setId: string) => {
        setSetError(null)
        setOpenSetMenuId(null)
        setSavingSetId(setId)
        try {
            await deleteSet(sessionId, setId)
            setLoadState(prev => prev.status !== "success" ? prev : {
                ...prev,
                session: {
                    ...prev.session,
                    exercises: prev.session.exercises.map(e => e.id !== exerciseId ? e : {
                        ...e,
                        sets: e.sets.filter(set => set.id !== setId),
                    }),
                },
            })
        } catch (err) {
            setSetError({ setId, message: err instanceof Error ? err.message : "Can't remove the set, try again." })
        } finally {
            setSavingSetId(null)
        }
    }

    const reloadSession = () => {
        setLoadState({status: "loading"})
        setReloadCount(count => count + 1)
    }

    // The load lives inside the effect so its cleanup can ignore an answer for an
    // older sessionId or an older reload.
    useEffect(()=>{
        let ignore = false
        const loadSession = async () => {
            try{
                const resp = await getWorkoutSession(sessionId)
                if (ignore) return
                setLoadState(resp ? {status: "success", session: resp} : {status: "notFound"})
            }catch(err){
                if (ignore) return
                setLoadState({status: "error", message: err instanceof Error ? err.message : "Session failed to load."})
            }
        }
        void loadSession()
        return () => { ignore = true }
    }, [sessionId, reloadCount])

    // Errors are not caught here: they reach the row, which shows them next to its tick.
    // The saved set from the server replaces ours, so completedAt comes from the server.
    const completeSessionSet = async (exerciseId: string, setId: string, values: PerformedValues) => {
        const saved = await updateSessionSet(sessionId, setId, { ...values, completed: true })
        setLoadState(prev => prev.status !== "success" ? prev : {
            ...prev,
            session: { ...prev.session, exercises: updateSet(prev.session.exercises, exerciseId, setId, () => saved) },
        })
    }

    const uncompleteSessionSet = async (exerciseId: string, setId: string) => {
        const saved = await updateSessionSet(sessionId, setId, { completed: false })
        setLoadState(prev => prev.status !== "success" ? prev : {
            ...prev,
            session: { ...prev.session, exercises: updateSet(prev.session.exercises, exerciseId, setId, () => saved) },
        })
    }

    // The server's order is the truth: rebuild from the ids it returns instead of swapping locally.
    const moveSessionExercise = async (exerciseId: string, direction: -1 | 1) => {
        setMoveError(null)
        setMoving(true)
        try {
            const ids = await moveExercise(sessionId, exerciseId, direction)
            setLoadState(prev => prev.status !== "success" ? prev : {
                ...prev,
                session: { ...prev.session, exercises: orderExercises(prev.session.exercises, ids) },
            })
        } catch (err) {
            setMoveError({ id: exerciseId, message: err instanceof Error ? err.message : "Can't move this exercise, try again." })
        } finally {
            setMoving(false)
        }
    }

    const finish = async () => {
        setFinishing(true)
        setFinishError(null)
        try {
            const finished = await finishWorkout(sessionId)
            setIncompleteFinish(false)
            setAward(finished.award)
            setLoadState({ status: "success", session: finished.session })
        } catch (err) {
            setFinishError(err instanceof Error ? err.message : "Can't finish your workout, try again.")
        } finally {
            setFinishing(false)
        }
    }

    if (loadState.status === "loading") return <LoadingState message="Loading your session"/>
    if (loadState.status === "notFound") return <NotFoundState title="Session Not Found"/>
    if (loadState.status === "error")
        return(<ErrorState
            message={loadState.message}
            action={
                <Button
                    onClick={reloadSession}
                    variant="secondary"
                >
                    Retry
                </Button>
            }
        />)
    const { session } = loadState
    const sets = session.exercises.flatMap(e => e.sets)
    const doneCount = sets.filter(s => s.completedAt !== null).length

    const requestFinish = () =>
    doneCount < sets.length
        ? setIncompleteFinish(true)
        : void finish()

    const addSessionSet = async (exId: string)=>{
        setAddSetError(null)
        setAddingSet(true)
        try{
            const added = await addSet(session.id, exId)
            // Match by id, not by index: a move can reorder the list while the request runs.
            setLoadState(prev => prev.status !== "success" ? prev: {
                ...prev,
                session:{
                    ...prev.session,
                    exercises: prev.session.exercises.map((e)=>(e.id !== exId ? e :{
                        ...e,
                        sets : [...e.sets, added]
                    }))
                }
            })
        }catch(err){
            setAddSetError({exerciseId: exId, message: err instanceof Error ? err.message : "cant Add set to this exercise."})
        }finally{
            setAddingSet(false)
        }
    }
    const isReadOnly = session.status !== "IN_PROGRESS"

    const addExercisesButton = <Button variant="secondary" onClick={() => setShowPicker(true)}>Add exercises</Button>

    return(
        <div className="flex flex-col gap-5">
            <SessionHeader
            name={session.name}
            startedAt={session.startedAt}
            finishedAt={session.completedAt}
            status={session.status}
            doneCount={doneCount}
            totalCount={sets.length}
            isReadOnly={isReadOnly}
            finishing={finishing}
            onFinish={requestFinish}
            onDiscard={() => setShowDiscard(true)}
            />
            {finishError && !incompleteFinish && <p role="alert" className="text-app-danger">{finishError}</p>}
            {session.status === "COMPLETED" && session.summary &&
                <SessionSummaryCard summary={session.summary} award={award}/>
            }
            {!isReadOnly && session.exercises.length === 0
                ? <EmptyState title="No exercises yet" action={addExercisesButton}/>
                : <ol className="flex flex-col gap-5">
                    {session.exercises.map((exercise, i)=>
                        <li key={exercise.id}>
                            <ExerciseSessionCard
                            exercise={exercise}
                            position={i + 1}
                            isFirst={i === 0}
                            isLast={i === session.exercises.length - 1}
                            isReadOnly={isReadOnly}
                            isAddingSet={addingSet}
                            isMoving={moving}
                            openSetMenuId={openSetMenuId}
                            savingSetId={savingSetId}
                            addSetError={exercise.id === addSetError?.exerciseId ? addSetError.message : null}
                            moveError={moveError?.id === exercise.id ? moveError.message : null}
                            setError={setError}
                            toggleSetMenu={toggleSetMenu}
                            onMove={(direction) => void moveSessionExercise(exercise.id, direction)}
                            onAddSet={addSessionSet}
                            onCompleteSet={completeSessionSet}
                            onUncompleteSet={uncompleteSessionSet}
                            onChangeSetType={changeSetType}
                            onRemoveSet={removeSessionSet}
                            />
                        </li>
                    )}
                </ol>
            }
            {!isReadOnly && session.exercises.length > 0 && session.exercises.length < MAX_EXERCISES && addExercisesButton}
            {!isReadOnly && session.exercises.length >= MAX_EXERCISES && <p className="text-sm text-app-text-secondary">{`A workout can have at most ${MAX_EXERCISES} exercises.`}</p>}
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
    )
}
