import { Link } from "react-router-dom";
import Card from "../../components/ui/Card";
import type{ WorkoutPlan } from "./workout.types";

interface WorkoutsCardProps
{
    workout: WorkoutPlan
}

export default function WorkoutPlanCard(props: WorkoutsCardProps){
    return(<article>
        <Link
            to={`/workouts/plans/${props.workout.id}`}
            className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary focus-visible:ring-offset-2"
        >
        <Card className="space-y-3">
        <div className="flex items-center gap-3 text-app-primary">
            <h1 className="text-xl font-semibold">{props.workout.name}</h1>
            <h3 className="text-sm uppercase"> {props.workout.type} </h3>
        </div>
        <p className="text-app-text-secondary">{props.workout.days} Days per Week.</p>
        <p className="text-app-text-secondary">{props.workout.description}</p>
        </Card>
        </Link>
    </article>
    )
}