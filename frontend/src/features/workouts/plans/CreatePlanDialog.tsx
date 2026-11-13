import React, { useState } from "react"
import { useNavigate } from "react-router-dom"
import { postWorkoutPlan } from "./plans.api"
import Form_input from "../../../components/ui/Form_input"
import Button from "../../../components/ui/Button"
import Dialog from "../../../components/ui/Dialog"
import { CONTROL_CHARACTER, PLAN_DESCRIPTION_MAX, PLAN_NAME_MAX, VISIBLE_CHARACTER } from "../shared/limits"

export default function CreatePlanDialog(props: { onClose: () => void })
{
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()

    const submitCreate = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (submitting) return
        if (!VISIBLE_CHARACTER.test(name)) { setError("Plan name is required."); return }
        if ([...name.trim()].length > PLAN_NAME_MAX) { setError(`Plan name can't be more than ${PLAN_NAME_MAX} characters.`); return }
        if (CONTROL_CHARACTER.test(name)) { setError("Plan name can't contain line breaks or tabs."); return }
        if ([...description.trim()].length > PLAN_DESCRIPTION_MAX) { setError(`Description can't be more than ${PLAN_DESCRIPTION_MAX} characters.`); return }
        if (CONTROL_CHARACTER.test(description)) { setError("Description can't contain line breaks or tabs."); return }
        setSubmitting(true)
        setError(null)
        try {
            const plan = await postWorkoutPlan({
                name: name.trim(),
                description: description.trim().length ? description.trim() : null,
            })
            // A new plan has no days yet, so the next step is always the plan page.
            navigate(`/workouts/plans/${plan.id}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : "Could not create the plan. Please try again.")
            setSubmitting(false)
        }
    }

    return (
        <Dialog isWorking={submitting} title="Create a plan" onClose={props.onClose}>
            <form onSubmit={submitCreate} noValidate>
                <div className="flex flex-col gap-2 mt-3">
                    <Form_input id="create-plan-name" label="Plan name" type="text"
                                value={name} onChange={setName} />
                    <Form_input id="create-plan-description" label="Description (optional)" type="text"
                                value={description} onChange={setDescription} required={false} />
                    {error && <p className="text-app-danger">{error}</p>}
                </div>
                <div className="flex gap-2 mt-3">
                    <Button type="submit" className="flex-2" disabled={submitting}>{submitting ? "Creating..." : "Create"}</Button>
                    <Button type="button" className="border border-app-border flex-1" variant="secondary" disabled={submitting} onClick={props.onClose}>Cancel</Button>
                </div>
            </form>
        </Dialog>
    )
}
