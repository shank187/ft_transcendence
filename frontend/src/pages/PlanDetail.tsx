import { useParams } from "react-router-dom"

export default function PlanDetail()
{
    const {planId} = useParams()
    return(
        <div>
            <h1>Plan detail of {planId}</h1>
        </div>
    )
}