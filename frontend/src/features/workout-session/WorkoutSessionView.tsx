import { useCallback, useEffect, useState } from "react"
import type { PerformedValues, WorkoutSession } from "./workout-session.types";
import {finishWorkout, getWorkoutSession, updateSessionSet } from "./workout-session.api";
import { updateSet } from "./workout-session.helpers";
import LoadingState from "../../components/states/LoadingState";
import NotFoundState from "../../components/states/NotFoundState";
import ErrorState from "../../components/states/ErrorState";
import Button from "../../components/ui/Button";
import ExerciseSessionCard from "./ExerciseSessionCard";
import SessionHeader from "./SessionHeader";
import DiscardWorkoutDialog from "./DiscardWorkoutDialog";
import FinishingDialog from "./FinishingDialog";

type LoadStateType =
    | { status: "loading" }
    | { status: "error", message: string }
    | { status: "notFound" }
    | { status: "success", session: WorkoutSession }

export default function WorkoutSessionView(props: {sessionId: string})
{
    // page states
    const [loadState, setLoadState] = useState<LoadStateType>({status:"loading"});
    //discard states
    const [showDiscard, setShowDiscard] = useState(false);
    // finishing state
    const [incompleteFinish, setIncompleteFinish] = useState(false)

    const [finishing, setFinishing] = useState(false)
    const [finishError, setFinishError] = useState<string|null>(null)

    const getSession = useCallback( async () =>{
        setLoadState({status: "loading"})
        try{
            const resp = await getWorkoutSession(props.sessionId)
            if(resp)
                setLoadState({status: "success", session: resp})
            else
                setLoadState({status: "notFound"})
        }catch(err){
            setLoadState({status: "error", message: err instanceof Error ? err.message : "Session failed to load."})
        }
    }
    , [props.sessionId])

    useEffect(()=>{
        void getSession();
    }
    ,[getSession])

    // Errors are not caught here: they reach the row, which shows them next to its tick.
    // The saved set from the server replaces ours, so completedAt comes from the server.
    const completeSessionSet = async (exerciseId: string, setId: string, values: PerformedValues) => {
        const saved = await updateSessionSet(props.sessionId, setId, { ...values, completed: true })
        setLoadState(prev => prev.status !== "success" ? prev : {
            ...prev,
            session: { ...prev.session, exercises: updateSet(prev.session.exercises, exerciseId, setId, () => saved) },
        })
    }

    const finish = async () => {
        setFinishing(true)
        setFinishError(null)
        try {
            await finishWorkout(props.sessionId)
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
    const sets = loadState.session.exercises.flatMap(e => e.sets)
    const doneCount = sets.filter(s => s.completedAt !== null).length

    const requestFinish = () =>
    doneCount < sets.length
        ? setIncompleteFinish(true)   // some sets not done → ask first
        : void finish()

    const isReadOnly = loadState.session.status !== "IN_PROGRESS"

    return(
        <div className="flex flex-col gap-5">
            <SessionHeader
            name={loadState.session.name}
            startedAt={loadState.session.startedAt}
            doneCount={doneCount}
            totalCount={sets.length}
            onDiscard = {()=> setShowDiscard(true)}
            onFinish = {()=> requestFinish()}
            finishing={finishing}
            status={loadState.session.status}
            isReadOnly={isReadOnly}
            finishedAt={loadState.session.completedAt}
            />
            <ol className="flex flex-col gap-5">
                {loadState.session.exercises.map((exercise, i)=>
                    <li key={exercise.id}>
                        <ExerciseSessionCard
                        isReadOnly={isReadOnly}
                        exercise={exercise}
                        position={i + 1}
                        onCompleteSet={completeSessionSet}
                        />
                    </li>
                )}
            </ol>
        {showDiscard && <DiscardWorkoutDialog onClose={()=>setShowDiscard(false)} sessionId={props.sessionId}/>}
        {incompleteFinish && <FinishingDialog onFinish={()=>finish()} error={finishError} saving={finishing} onClose={()=> setIncompleteFinish(false)} />}
        </div>
    )
}