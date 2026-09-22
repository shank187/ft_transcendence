import Card from "../components/ui/Card"

type info_plan = {
    id: string;
    name: string;
    description: string;
    type: string;
    days: number;
}


function Workouts()
{
    const plan_list: info_plan[] = [
    {
        id: "1",
        name: "push-pull-leg",
        description:"plan for cutting",
        type: "custom",
        days: 5,
    },
    {
        id: "2",
        name: "pro split",
        description:"plan for bulking",
        type: "custom",
        days: 4,
    },
]
    return (
        <div  className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {plan_list.map((plan)=>(
                <Card key={plan.id} className="space-y-3"> 
                    <div className="flex items-center gap-3 text-app-primary">
                        <h1 className=" text-xl font-semibold">{plan.name}.</h1>
                        <p className="text-sm uppercase">{plan.type}</p>
                    </div>
                    <p className="text-app-text-secondary">{plan.days} days per week.</p>
                    <p className="text-app-text-secondary">{plan.description}</p>
                </Card>
            ))}
        </div>
    )
}

export default Workouts