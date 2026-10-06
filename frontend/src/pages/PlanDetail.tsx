import { useParams } from "react-router-dom"
import PlanDetailView from "../features/plan-details/PlanDetailView"

export default function PlanDetail()
{
    const {planId} = useParams()
    if(!planId) return <p>Plan not found.</p>
    return(
        <PlanDetailView planId = {planId}/>
    )
}