import { useParams } from "react-router-dom"
import PlanDetailView from "../features/plan-details/PlanDetailView"

export default function PlanDetail()
{
    const {planId} = useParams()
    return(
        <PlanDetailView planId = {planId}/>
    )
}