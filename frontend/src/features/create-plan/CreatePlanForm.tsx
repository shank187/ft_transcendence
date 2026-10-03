import React, { useState } from "react"
import Form_input from "../../components/ui/Form_input"
import Button from "../../components/ui/Button"
import createWorkoutPlan from "./create-plan.api"
import { useNavigate } from "react-router-dom"

export default function CreatePlanForm()
{
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [submitting, setSubmitting] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>)=> {
        e.preventDefault()
        if(name.trim().length === 0){
            setError("Plan name is required.")
            return
        }
        setError(null)
        setSubmitting(true)
        try{
            const resp = await createWorkoutPlan({
            name: name.trim(),
            description: description.trim().length ? description.trim() : null
            })
            navigate(`/workouts/plans/${resp.id}`, {replace: true})
        }
        catch(err){
            setError(err instanceof Error ? err.message: "Failed to send Your Workout.")
        }
        finally{
            setSubmitting(false)
        }
        
    }

    return(
        <form onSubmit={handleSubmit} noValidate>
            <Form_input
            id = "plan-name"
            type="text"
            value={name}
            onChange={setName}
            label="Plan name"
            />
            <Form_input
            id = "plan-description"
            type="text"
            value={description}
            onChange={setDescription}
            label="Description"
            required ={false}
            />
            {error && <p className="text-app-danger">{error}</p>}
            <Button disabled={submitting} type="submit">{submitting?"Creating..." : "Create plan"}</Button>
        </form>
    )
}


