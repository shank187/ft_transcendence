import { useCallback, useEffect, useState } from "react"
import type {PlanDetail} from "./plan-detail.types"
import getPlanDetails from "./plan-detail.api"
import LoadingState from "../../components/states/LoadingState"

export default function PlanDetailView(props: {planId: string})
{
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string|null>(null)
    const [plan, setPlan] = useState<PlanDetail|null>(null)

    const loadPlan = useCallback( async ()=>{
        setError(null)
        setLoading(true)
        try{
            setPlan(await getPlanDetails(props.planId))
        }catch(err){
            setError(err instanceof(Error) ? err.message : "Failed to load page, try again.")
        }finally{
            setLoading(false)
        }
    }, [props.planId])


    useEffect(()=>{
        loadPlan();
    },[loadPlan])
    if(loading) return <LoadingState message="Loading details..."/>
        
    return(
        <div>
            
        </div>
    )
} 