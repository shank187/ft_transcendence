import { useState } from "react"
import type { PlanDay } from "./plan-detail.types"
import { deleteWorkoutDay } from "./plan-detail.api"
import Button from "../../components/ui/Button"
import Dialog from "../../components/ui/Dialog"

export default function DeleteDayDialog(props: {
    planId: string
    day: PlanDay
    onClose: () => void
    onDeleted: (remainingDays: PlanDay[]) => void
})
{
    const [deleteDayError, setDeleteDayError] = useState<string|null>(null)
    const [submitting, setSubmitting] = useState(false)

    const deleteDay = async ()=>{
        setSubmitting(true)
        try{
            const remainingDays = await deleteWorkoutDay(props.planId, props.day.id);
            props.onDeleted(remainingDays)
            props.onClose()
        }catch(err){
            setDeleteDayError(err instanceof Error ? err.message : "Cant delete this day")
        }finally{
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={true} title="Confirm Deletion" onClose={props.onClose}>
            {deleteDayError && <p className="text-app-danger">{deleteDayError}</p>}
            <Button variant="danger" disabled={submitting} onClick={deleteDay} >{submitting?"Deleting":"Confirm"}</Button>
            <Button variant="secondary" onClick={props.onClose}>Cancel</Button>
        </Dialog>
    )
}
