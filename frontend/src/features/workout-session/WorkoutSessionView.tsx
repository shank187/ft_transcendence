import { useCallback, useEffect, useState } from "react"
import type { WorkoutSession } from "./workout-session.types";
import { getWorkoutSession } from "./workout-session.api";
import LoadingState from "../../components/states/LoadingState";
import NotFoundState from "../../components/states/NotFoundState";
import ErrorState from "../../components/states/ErrorState";
import Button from "../../components/ui/Button";



type LoadStateType =
    | { status: "loading" }
    | { status: "error", message: string }
    | { status: "notFound" }
    | { status: "success", session: WorkoutSession }

export default function WorkoutSessionView(props: {sessionId: string})
{
    const [loadState, setLoadState] = useState<LoadStateType>({status:"loading"});

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
    ,[])

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
    return(
        <div>
            active session: {props.sessionId} 
        </div>
    )
}