import { useParams } from "react-router-dom"
import NotFoundState from "../components/states/NotFoundState"
import WorkoutSessionView from "../features/workout-session/WorkoutSessionView"

export default function WorkoutSession ()
{
    const {sessionId} = useParams()

    if(!sessionId) return <NotFoundState title="Workout not found."/>

    return(
        <WorkoutSessionView sessionId={sessionId}/>
    )
}