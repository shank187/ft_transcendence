import { useParams } from "react-router-dom";
import DayEditorView from "../features/day-editor/DayEditorView";
import NotFoundState from "../components/states/NotFoundState";

export default function DayEditor()
{
    const {planId, dayId} = useParams()
    if(!planId || !dayId) return <NotFoundState title="Day not found."/>

    return(
        <DayEditorView planId={planId} dayId={dayId}/>
    )
}