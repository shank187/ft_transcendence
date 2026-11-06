import { useCallback, useEffect, useState } from "react"
import type { PerformedValues, WorkoutSession } from "./workout-session.types";
import { addExercises, addSet, deleteSet, finishWorkout, getWorkoutSession, moveExercise, rememberSessionExercises, updateSessionSet } from "./workout-session.api";
import { orderExercises, updateSet } from "./workout-session.helpers";
import LoadingState from "../../components/states/LoadingState";
import NotFoundState from "../../components/states/NotFoundState";
import ErrorState from "../../components/states/ErrorState";
import Button from "../../components/ui/Button";
import ExerciseSessionCard from "./ExerciseSessionCard";
import SessionHeader from "./SessionHeader";
import DiscardWorkoutDialog from "./DiscardWorkoutDialog";
import FinishingDialog from "./FinishingDialog";
import type { Exercise } from "../exercises/exercise.types";
import { ExercisePicker } from "../exercises/ExercisePicker";
import Dialog from "../../components/ui/Dialog";
import type { SetType } from "../day-editor/day-editor.types";

type LoadStateType =
    | { status: "loading" }
    | { status: "error", message: string }
    | { status: "notFound" }
    | { status: "success", session: WorkoutSession }

export default function WorkoutSessionView(props: {sessionId: string})
{
    const { sessionId } = props
    const [loadState, setLoadState] = useState<LoadStateType>({status:"loading"});
    const [showDiscard, setShowDiscard] = useState(false);
    const [incompleteFinish, setIncompleteFinish] = useState(false)
    const [finishing, setFinishing] = useState(false)
    const [finishError, setFinishError] = useState<string|null>(null)

    const [showPicker, setShowPicker] = useState(false)
    const [addError, setAddError] = useState<string | null>(null)
    const [adding, setAdding] = useState(false)

    const [addSetError, setAddSetError] = useState<{ exerciseId: string, message: string } | null>(null)
    const [addingSet, setAddingSet] = useState<boolean>(false)

    const [openSetMenuId, setOpenSetMenuId] = useState<string | null>(null)
    const [setError, setSetError] = useState<{ setId: string, message: string } | null>(null)

    const [moving, setMoving] = useState(false)
    const [moveError, setMoveError] = useState<{ id: string, message: string } | null>(null)

    const addSelectedExercises = async (selected: Exercise[]) => {
        setAdding(true)
        setAddError(null)
        try {
            rememberSessionExercises(selected.map(e => ({
                id: e.id, name: e.name, type: e.type, primaryMuscle: e.primaryMuscle, imageUrl: e.imageUrl,
            })))
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

    const changeSetType = async (exerciseId: string, setId: string, setType: SetType) => {
        setSetError(null)
        try {
            const saved = await updateSessionSet(sessionId, setId, { setType })
            setLoadState(prev => prev.status !== "success" ? prev : {
                ...prev,
                session: { ...prev.session, exercises: updateSet(prev.session.exercises, exerciseId, setId, () => saved) },
            })
            setOpenSetMenuId(null)
        } catch (err) {
            setSetError({ setId, message: err instanceof Error ? err.message : "Can't change the set type, try again." })
        }
    }

    const removeSessionSet = async (exerciseId: string, setId: string) => {
        setSetError(null)
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
            setOpenSetMenuId(null)
        } catch (err) {
            setSetError({ setId, message: err instanceof Error ? err.message : "Can't remove the set, try again." })
        }
    }

    const getSession = useCallback( async () =>{
        setLoadState({status: "loading"})
        try{
            const resp = await getWorkoutSession(sessionId)
            if(resp)
                setLoadState({status: "success", session: resp})
            else
                setLoadState({status: "notFound"})
        }catch(err){
            setLoadState({status: "error", message: err instanceof Error ? err.message : "Session failed to load."})
        }
    }
    , [sessionId])

    useEffect(()=>{
        void getSession();
    }
    ,[getSession])

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
            await finishWorkout(sessionId)
            setIncompleteFinish(false)
            await getSession()
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
                    onClick={()=> getSession()}
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
        const exIndex = session.exercises.findIndex((e)=> e.id === exId)
        try{
            const added = await addSet(session.id, exId)
            if(exIndex !== -1)
            {
                setLoadState(prev => prev.status !== "success" ? prev: {
                    ...prev,
                    session:{
                        ...prev.session,
                        exercises: prev.session.exercises.map((e, i)=>(i!== exIndex ? e :{
                            ...e,
                            sets : [...e.sets, added]
                        }))
                    }
                })
            }
        }catch(err){
            setAddSetError({exerciseId: exId, message: err instanceof Error ? err.message : "cant Add set to this exercise."})
        }finally{
            setAddingSet(false)
        }
    }
    const isReadOnly = session.status !== "IN_PROGRESS"

    return(
        <div className="flex flex-col gap-5">
            <SessionHeader
            name={session.name}
            startedAt={session.startedAt}
            doneCount={doneCount}
            totalCount={sets.length}
            onDiscard = {()=> setShowDiscard(true)}
            onFinish = {()=> requestFinish()}
            finishing={finishing}
            status={session.status}
            isReadOnly={isReadOnly}
            finishedAt={session.completedAt}
            />
            <ol className="flex flex-col gap-5">
                {session.exercises.map((exercise, i)=>
                    <li key={exercise.id}>
                        <ExerciseSessionCard
                        toggleSetMenu={toggleSetMenu}
                        openSetMenuId={openSetMenuId}
                        setError={setError}
                        onChangeSetType={changeSetType}
                        onRemoveSet={removeSessionSet}
                        isAddingSet={addingSet}
                        addSetError={exercise.id === addSetError?.exerciseId ? addSetError.message : null}
                        isReadOnly={isReadOnly}
                        exercise={exercise}
                        position={i + 1}
                        isFirst={i === 0}
                        isLast={i === session.exercises.length - 1}
                        isMoving={moving}
                        moveError={moveError?.id === exercise.id ? moveError.message : null}
                        onMove={(direction) => void moveSessionExercise(exercise.id, direction)}
                        onCompleteSet={completeSessionSet}
                        onUncompleteSet={uncompleteSessionSet}
                        onAddSet={addSessionSet}
                        />
                    </li>
                )}
            </ol>
        {showDiscard && <DiscardWorkoutDialog onClose={()=>setShowDiscard(false)} sessionId={sessionId}/>}
        {incompleteFinish && <FinishingDialog onFinish={()=>finish()} error={finishError} saving={finishing} onClose={()=> setIncompleteFinish(false)} />}
        {!isReadOnly && <Button onClick={() => setShowPicker(true)}>Add exercises</Button>}
        {showPicker &&
            <Dialog 
            variant="drawer"
            title="Add exercises"
            isWorking={adding} 
            showClose
            onClose={() => setShowPicker(false)}
            >
                <ExercisePicker onAdd={addSelectedExercises} />
                {addError && <p className="text-app-danger">{addError}</p>}
            </Dialog>}
        </div>
    )
}