import React, { useState } from "react"
import type { PlanDay } from "../shared/workouts.types"
import { createWorkoutDay } from "./plan-details.api"
import Form_input from "../../../components/ui/Form_input"
import Button from "../../../components/ui/Button"
import { MAX_DAYS_PER_PLAN, dayNameError } from "../shared/limits"

interface AddDayFormProps {
    planId: string
    dayCount: number
    onAdded: (day: PlanDay) => void
    onClose: () => void
}

export default function AddDayForm(props: AddDayFormProps)
{
    const [dayname, setDayName] = useState("")
    const [nameError, setErrorForm] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const submitDay =  async (e: React.FormEvent<HTMLFormElement>) =>{
        e.preventDefault();
        if(submitting) return
        const name = dayname.trim()
        setErrorForm(null)
        const inputError = dayNameError(name)
        if (inputError) { setErrorForm(inputError); return }
        if (props.dayCount >= MAX_DAYS_PER_PLAN) {
            setErrorForm(`A plan can have at most ${MAX_DAYS_PER_PLAN} days.`)
            return
        }
        setSubmitting(true)
        try{
            const createdDay = await createWorkoutDay(props.planId, name);
            props.onAdded(createdDay)
            props.onClose()
        }catch(err)
        {
            setErrorForm(err instanceof Error ? err.message : "Could not add the day. Please try again.")
        }finally{
            setSubmitting(false)
        }
    }

    // same as Cancel, which is hidden while submitting
    const cancelOnEscape = (e: React.KeyboardEvent<HTMLFormElement>) => {
        if (e.key === "Escape" && !submitting) props.onClose()
    }

    return (
        <form onSubmit={submitDay} onKeyDown={cancelOnEscape} noValidate className="flex flex-col gap-3 rounded-2xl border border-app-border bg-app-surface p-4">
            <Form_input
                id="day-name"
                label="Enter a day name."
                value = {dayname}
                onChange={setDayName}
                type="text"
            />
            {nameError && (<p className="text-sm text-app-danger">{nameError}</p>)}
            <div className="flex gap-2">
                <Button type="submit" className="min-h-11 flex-1 font-semibold" disabled={submitting}>
                    {submitting ? "Saving..." : "Save"}
                </Button>
                {!submitting && <Button variant="secondary" className="min-h-11 flex-1 border border-app-border" onClick={props.onClose}>Cancel</Button>}
            </div>
        </form>
    )
}
