import { useState } from "react";
import Button from "../../components/ui/Button";
import Dialog from "../../components/ui/Dialog";
import { discardWorkout } from "./workout-session.api";
import { useNavigate } from "react-router-dom";

export default function DiscardWorkoutDialog(props:{
    sessionId: string, 
    onClose: ()=> void,
})
{
    const [discarding , setDiscarding] = useState(false)
    const [discardError , setDiscardError] = useState<string| null>(null)
    const navigate = useNavigate()

    const discard = async()=>{
        setDiscarding(true)
        try{

            await discardWorkout(props.sessionId)
            navigate("/workouts", {replace: true})
        }catch(err){
            setDiscardError( err instanceof Error ? err.message : "Cant Discard your workout, try again later.")
        }finally{
            setDiscarding(false)
        }
    }

    return(
        <Dialog
        title="Discard this workout?"
        showClose={true}
        onClose={()=> props.onClose()}
        isWorking = {discarding}
        >
            <div>
                Sets you logged in this Workout won't be saved.
                {discardError && <p className=" text-app-danger"></p>}
                <div>
                    <Button variant="danger" onClick={()=> discard()}>Discard Workout</Button>
                    <Button variant="secondary" onClick={()=> props.onClose()}>Keep training</Button>
                </div>
            </div>
        </Dialog>
    )
}