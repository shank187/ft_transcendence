import { useEffect, useState } from "react"
import type {planDetail} from "./plan-detail.types"

export default function PlanDetailView(props:{planId: string| undefined})
{
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string|null>(null)
    const [plan, setPlan] = useState<planDetail|null>(null)

    const loadPlan = async ()=>{
        try{
            setError(null)
            setLoading(true)
        }catch(err){
            setError(err instanceof(Error) ? err.message : "Failed to load page, try again.")
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        loadPlan();
    },[])

    return(
        <div>
            
        </div>
    )
}