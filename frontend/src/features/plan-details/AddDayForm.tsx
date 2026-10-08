import React, { useState } from "react"
import type { PlanDay } from "./plan-detail.types"
import { createWorkoutDay } from "./plan-detail.api"
import Form_input from "../../components/ui/Form_input"
import Button from "../../components/ui/Button"

export default function AddDayForm(props: {
    planId: string
    dayCount: number
    onAdded: (day: PlanDay) => void
    onClose: () => void
})
{
    const [dayname, setDayName] = useState("")
    const [nameError, setErrorForm] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const submitDay =  async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        if(submitting) return
        const name = dayname.trim()
        setErrorForm(null)
        if( name.length === 0  || name.length  > 30){
            setErrorForm("Invalid name")
            return
        }
        if (props.dayCount >= 7) {
            setErrorForm("Maximum 7 days per plan reached.")
            return
        }
        setSubmitting(true)
        try{
            const createdDay = await createWorkoutDay(props.planId, name);
            props.onAdded(createdDay)
            props.onClose()
        }catch(err)
        {
            setErrorForm(err instanceof Error ? err.message : "could not add day.")
        }finally{
            setSubmitting(false)
        }
    }

    // same as Cancel, which is hidden while submitting
    const cancelOnEscape = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Escape" && !submitting) props.onClose()
    }

    return (
        <form onSubmit={submitDay} onKeyDown={cancelOnEscape} noValidate>
            <Form_input
                id="day-name"
                label="Enter a day name."
                value = {dayname}
                onChange={setDayName}
                type="text"
            />
            {nameError && (<p className="text-sm text-app-danger">{nameError}</p>)}
            <Button
            type="submit"
            disabled = {submitting}
            >
                Save
            </Button>
            {!submitting && (<Button variant="secondary"  onClick={props.onClose}>Cancel</Button>)}
        </form>
    )
}
