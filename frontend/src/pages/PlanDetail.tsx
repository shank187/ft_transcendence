import { useParams } from "react-router-dom"
import PlanDetailView from "../features/plan-details/PlanDetailView"
import NotFoundState from "../components/states/NotFoundState"

export default function PlanDetail()
{
    const {planId} = useParams()
    if(!planId) return <NotFoundState title="Plan not found."/>
    return(
        <PlanDetailView planId = {planId}/>
    )
}