import { useEffect, useState } from "react";
import type {WorkoutPlan} from "./plans.types";
import {getWorkouts} from "./plans.api";
import WorkoutPlanCard from "./WorkoutPlanCard";
import { Dumbbell, Plus } from "lucide-react";
import Button from "../../../components/ui/Button";
import LoadingState from "../../../components/states/LoadingState";
import ErrorState from "../../../components/states/ErrorState";
import CreatePlanDialog from "./CreatePlanDialog";
import { MAX_PLANS_PER_USER } from "../shared/limits";

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
    const canCreate = workouts.length < MAX_PLANS_PER_USER

    if(loading)
        return <LoadingState message="Loading Plans..."/>
    if(error)
        return(
            <ErrorState
            message={error}
            action={<Button variant="secondary" className="min-h-11" onClick={retryWorkouts}>Retry</Button>}
            />
        )
    if(workouts.length === 0)
        return(
            <section className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold md:text-xl">My plans</h2>
                <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-app-border bg-app-surface px-6 py-10 text-center">
                    <span className="flex size-18 items-center justify-center rounded-full bg-app-primary/10 text-app-primary">
                        <Dumbbell aria-hidden="true" className="size-8.5" strokeWidth={1.75} />
                    </span>
                    <strong className="mt-1 text-lg font-semibold">No plans yet</strong>
                    <p className="max-w-70 text-sm leading-relaxed text-app-text-secondary">A plan keeps your training days and target sets, so starting a workout takes one tap.</p>
                    <Button className="mt-2 min-h-12 gap-2 font-bold" onClick={() => setIsCreateOpen(true)}>
                        <Plus aria-hidden="true" className="size-4.5" strokeWidth={2.5} />
                        Create your first plan
                    </Button>
                </div>
                {createDialog}
            </section>
        )
    return (
        <section className="flex flex-col gap-3 md:gap-3.5">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold md:text-xl">
                    My plans <span className="text-sm font-normal text-app-text-muted md:text-[15px]">{workouts.length}</span>
                </h2>
                {canCreate &&
                    <Button variant="secondary" className="min-h-11 gap-1.5 border border-app-border font-semibold" onClick={() => setIsCreateOpen(true)}>
                        <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
                        New plan
                    </Button>
                }
            </div>
            {!canCreate && <p className="text-sm text-app-text-secondary">{`You can have at most ${MAX_PLANS_PER_USER} plans.`}</p>}

            <ul className="flex flex-col gap-2.5 md:grid md:grid-cols-[repeat(auto-fill,minmax(260px,1fr))] md:gap-4">
                {workouts.map((workout) => (
                    <WorkoutPlanCard
                        key={workout.id}
                        workout={workout}
                    />
                ))}
                {canCreate &&
                    <li className="hidden md:block">
                        <button type="button" onClick={() => setIsCreateOpen(true)} className="flex size-full min-h-42 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-app-border text-[15px] font-semibold text-app-text-secondary hover:border-app-primary hover:text-app-primary">
                            <Plus aria-hidden="true" className="size-5.5" strokeWidth={2.25} />
                            New plan
                        </button>
                    </li>
                }
            </ul>
            {createDialog}
        </section>
    )
}
