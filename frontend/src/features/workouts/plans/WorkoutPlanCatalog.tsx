import { useEffect, useState } from "react";
import type {WorkoutPlan} from "./plans.types";
import {getWorkouts} from "./plans.api";
import WorkoutPlanCard from "./WorkoutPlanCard";
import Button from "../../../components/ui/Button";
import EmptyState from "../../../components/states/EmptyState";
import emptyStateIcon from "../../../assets/empty-icon.png"
import LoadingState from "../../../components/states/LoadingState";
import ErrorState from "../../../components/states/ErrorState";
import CreatePlanDialog from "./CreatePlanDialog";

export default function WorkoutPlanCatalog()
{
    const [workouts, setWorkouts] = useState<WorkoutPlan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    
    const [reloadCount, setReloadCount] = useState(0)

    const retryWorkouts = () =>{
        setLoading(true)
        setError(null)
        setReloadCount(count => count + 1)
    }

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

    const createDialog = isCreateOpen && <CreatePlanDialog onClose={() => setIsCreateOpen(false)} />

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
            <>
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
                        onClick={() => setIsCreateOpen(true)}
                    >
                Create Plan
            </Button>}
            />
            {createDialog}
            </>
    )
    return (
        <section className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold">My Plans</h1>

                <Button onClick={() => setIsCreateOpen(true)}>
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
            {createDialog}
        </section>
    )
}