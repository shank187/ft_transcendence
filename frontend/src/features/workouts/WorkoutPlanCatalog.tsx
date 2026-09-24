import { useCallback, useEffect, useState } from "react";
import type {WorkoutPlan} from "./workout.types";
import getWorkouts from "./workout.api";
import WorkoutPlanCard from "./WorkoutPlanCard";
import Button from "../../components/ui/Button";


export default function WorkoutPlanCatalog()
{
    const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)

    
    const loadWorkouts = useCallback(
        async () => {
                try{
                    setLoading(true)
                    setError(null)
                    const data = await getWorkouts();
                    setWorkouts(data)

                }
                catch(err){
                    setError(err instanceof Error ? err.message : "Failed to load Workouts.")
                }
                finally{
                    setLoading(false)
                }
            }
    ,[])

    useEffect(()=>{
        console.log("loaded")
        void loadWorkouts();
    }
    ,[loadWorkouts])

    if(loading)
        return(
            <section>
                <h1>Loading Workouts...</h1>
            </section>
        )
    if(error)
        return(
            <section>
                <h1>ERROR: {error}</h1>
                <Button variant="secondary" onClick={()=> void loadWorkouts()}>Retry</Button>
            </section>
        )
    if(workouts.length === 0)
        return(
            <section>
                <h1>No workouts Added yet.</h1>
            </section>
    )
    return(
        <section className="grid gap-4 grid-cols-1 md:grid-cols-3">
            {workouts.map((workout) => (
                <WorkoutPlanCard key={workout.id} workout={workout} />
            ))}
        </section>
    )
}