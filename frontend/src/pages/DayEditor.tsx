import { useParams } from "react-router-dom";
import DayEditorView from "../features/day-editor/DayEditorView";

export default function DayEditor()
{
    const {planId, dayId} = useParams()
    if(!planId || !dayId) return <p>Not found</p>

    return(
        <DayEditorView planId={planId} dayId={dayId}/>
    )
}