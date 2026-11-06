import { useEffect, useState } from "react";
import type {WorkoutPlan} from "./workout.types";
import getWorkouts from "./workout.api";
import WorkoutPlanCard from "./WorkoutPlanCard";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/states/EmptyState";
import emptyStateIcon from "../../assets/empty-icon.png"
import { useNavigate } from "react-router-dom";
import LoadingState from "../../components/states/LoadingState";
import ErrorState from "../../components/states/ErrorState";

export default function WorkoutPlanCatalog()
{
    const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)
    const navigate = useNavigate()
    
    const [reloadCount, setReloadCount] = useState(0)

    const retryWorkouts = () =>{
        setLoading(true)
        setError(null)
        setReloadCount(count => count + 1)
    }

    // The load lives inside the effect so its cleanup can ignore an answer that
    // arrives after the page left or a newer retry started.
    useEffect(()=>{
        let ignore = false
        const loadWorkouts = async () => {
            try{
                const data = await getWorkouts();
                if (ignore) return
                setWorkouts(data)
            }
            catch(err){
                if (ignore) return
                setError(err instanceof Error ? err.message : "Failed to load Workouts.")
            }
            finally{
                if (!ignore) setLoading(false)
            }
        }
        void loadWorkouts()
        return () => { ignore = true }
    }
    ,[reloadCount])

    if(loading)
        return(
            <LoadingState message="Loading Plans..."/>
        )
    if(error)
        return(
            <ErrorState
            message={error}
            action={<Button
                variant="secondary"
                onClick={retryWorkouts}
            >
                Retry
            </Button>}
            />
        )
    if(workouts.length === 0)
        return(
            <EmptyState
            icon={
                <img
                src={emptyStateIcon}
                alt=""
                className="w-32"
                />
            }
            title="No plans yet."
            description="Create your first plan to get started."
            action={<Button
                        className="m-5"
                        onClick={()=> navigate('/workouts/new-plan')}
                    >
                Create Plan
            </Button>}
            />
    )
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">My Plans</h1>

                <Button onClick={() => navigate('/workouts/new-plan')}>
                    Create Plan
                </Button>
            </div>

            <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                {workouts.map((workout) => (
                    <WorkoutPlanCard
                        key={workout.id}
                        workout={workout}
                    />
                ))}
            </div>
        </section>
    )
}