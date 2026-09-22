import Card from "../../components/ui/Card";
import { WorkoutPlan } from "./workout.types";


function WorkoutPlanCard(props: WorkoutPlan){
    return(<article>
        <Card key={props.id} className="space-y-3">
        <div className="flex items-center gap-3 text-app-primary">
            <h1 className="text-xl font-semibold">{props.name}</h1>
            <h3 className="text-sm uppercase"> {props.type} </h3>
        </div>
        <p className="text-app-text-secondary">{props.days} Days per Week.</p>
        <p className="text-app-text-secondary">{props.description}</p>
        </Card>
    </article>
    )
}