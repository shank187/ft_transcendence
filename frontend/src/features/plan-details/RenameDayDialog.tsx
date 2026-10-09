import React, { useState } from "react"
import type { PlanDay } from "./plan-detail.types"
import { renameWorkoutDay } from "./plan-detail.api"
import Form_input from "../../components/ui/Form_input"
import Button from "../../components/ui/Button"
import Dialog from "../../components/ui/Dialog"

export default function RenameDayDialog(props: {
    planId: string
    day: PlanDay
    onClose: () => void
    onRenamed: (day: PlanDay) => void
})
{
    // the parent mounts this dialog once per rename
    const [renameName, setRenameName] = useState(props.day.name)
    const [renameError, setRenameError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)

    const submitRename = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (submitting) return
        const name = renameName.trim()
        if (name.length === 0 || name.length > 30) { setRenameError("Invalid name"); return }
        setSubmitting(true)
        setRenameError(null)
        try {
            const renamedDay = await renameWorkoutDay(props.planId, props.day.id, name)
            props.onRenamed(renamedDay)
            props.onClose()
        } catch (err) {
            setRenameError(err instanceof Error ? err.message : "could not rename day.")
        } finally {
            setSubmitting(false)
        }
    }

    return (
        <Dialog isWorking={submitting} open={true} title="Rename the day" onClose={props.onClose}>
            <form onSubmit={submitRename} noValidate>
                <Form_input id="rename-day" label="Day name" type="text"
                            value={renameName} onChange={setRenameName} />
                {renameError && <p className="text-app-danger">{renameError}</p>}
            <div className="flex gap-1 mt-3">
                    <Button type="button" className="border border-app-border flex-1" variant="secondary" disabled={submitting} onClick={props.onClose}>Cancel</Button>
                    <Button type="submit" className="flex-1" disabled={submitting}>{submitting ? "Saving..." : "Save"}</Button>
                </div>
            </form>
        </Dialog>
    )
}
