import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { deletePlan } from "./plan-detail.api"
import Button from "../../components/ui/Button"
import Dialog from "../../components/ui/Dialog"

export default function DeletePlanDialog(props: {
    planId: string
    name: string
    onClose: () => void
})
{
    const [deletePlanError, setDeletePlanError] = useState<string|null>(null)
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()

    const confirmDelete = async ()=>{
        setSubmitting(true)
        setDeletePlanError(null)
        try{
            await deletePlan(props.planId)
            navigate("/workouts", { replace: true })
        }catch(err){
            setDeletePlanError(err instanceof Error ? err.message : "Cant delete this plan")
        }finally{
            setSubmitting(false)
        }
    }

    return (
        <Dialog isWorking={submitting} open={true} title={`Delete ${props.name}?`} onClose={props.onClose}>
            <p>Past workouts stay in your history.</p>
            {deletePlanError && <p className="text-app-danger">{deletePlanError}</p>}
            <div className="flex justify-end gap-2 pt-2">
                <Button disabled={submitting} variant="secondary" className="border border-app-border" onClick={props.onClose}>Cancel</Button>
                <Button variant="danger" disabled={submitting} onClick={confirmDelete} >{submitting?"Deleting...":"Delete plan"}</Button>

            </div>
        </Dialog>
    )
}
