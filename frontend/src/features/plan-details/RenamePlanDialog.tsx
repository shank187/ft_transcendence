import React, { useState } from "react"
import type { PlanDetail } from "./plan-detail.types"
import { renamePlan } from "./plan-detail.api"
import Form_input from "../../components/ui/Form_input"
import Button from "../../components/ui/Button"
import Dialog from "../../components/ui/Dialog"

export default function RenamePlanDialog(props: {
    planId: string
    name: string
    description: string | null
    onClose: () => void
    onRenamed: (plan: PlanDetail) => void
})
{
    const [name, setName] = useState(props.name)
    const [description, setDescription] = useState(props.description ?? "")
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const submitRename = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (submitting) return
        if (name.trim().length === 0) { setError("Plan name is required."); return }
        setSubmitting(true)
        setError(null)
        try {
            const renamedPlan = await renamePlan(
                props.planId,
                name.trim(),
                description.trim().length ? description.trim() : null
            )
            props.onRenamed(renamedPlan)
            props.onClose()
        } catch (err) {
            setError(err instanceof Error ? err.message : "could not rename plan.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog open={true} title="Rename the plan" onClose={props.onClose}>
            <form onSubmit={submitRename} noValidate>
                <Form_input id="rename-plan-name" label="Plan name" type="text"
                            value={name} onChange={setName} />
                <Form_input id="rename-plan-description" label="Description (optional)" type="text"
                            value={description} onChange={setDescription} required={false} />
                {error && <p className="text-app-danger">{error}</p>}
                <Button type="button" variant="secondary" onClick={props.onClose}>Cancel</Button>
                <Button type="submit" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
            </form>
        </Dialog>
    )
}
