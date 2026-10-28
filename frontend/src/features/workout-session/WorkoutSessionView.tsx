export default function WorkoutSessionView(props: {sessionId: string})
{
    return(
        <div>
            active session: {props.sessionId} 
        </div>
    )
}