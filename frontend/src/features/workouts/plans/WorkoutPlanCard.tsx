import { Link } from "react-router-dom";
import Card from "../../../components/ui/Card";
import type{ WorkoutPlan } from "./plans.types";

interface WorkoutsCardProps
{
    workout: WorkoutPlan
}

export default function WorkoutPlanCard(props: WorkoutsCardProps){
    return(<li>
        <Link
            to={`/workouts/plans/${props.workout.id}`}
            className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2"
        >
        <Card className="h-full space-y-3">
        <div className="flex items-baseline gap-3 text-app-primary">
            <h2 className="min-w-0 break-words text-xl font-semibold">{props.workout.name}</h2>
            <p className="shrink-0 text-sm uppercase">{props.workout.type}</p>
        </div>
        <p className="text-app-text-secondary">{props.workout.days} Days per Week.</p>
        {props.workout.description && <p className="text-app-text-secondary">{props.workout.description}</p>}
        </Card>
        </Link>
    </li>
    )
}