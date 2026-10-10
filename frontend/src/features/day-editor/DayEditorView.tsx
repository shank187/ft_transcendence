export default function DayEditorView(props:{planId: string, dayId: string})
{
    return(
        <div>
            Edit your day plan :{props.planId} day: {props.dayId}.
        </div>
    )
}