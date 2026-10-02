import React, { useState } from "react"
import Form_input from "../../components/ui/Form_input"
import Button from "../../components/ui/Button"
export default function CreatePlanForm()
{
    const [name, setName] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>)=> {
        e.preventDefault()
        if(name.trim().length === 0){
            setError("Plan name is required.")
            return
        }
        setError(null)
        console.log(name)
    }

    return(
        <form onSubmit={handleSubmit} noValidate>
            <Form_input
            id = "plan-name"
            type="text"
            value={name}
            onChange={setName}
            label="Plan Name"
            />
            {error && <p className="text-app-danger">{error}</p>}
            <Button type="submit">Create</Button>
        </form>
    )
}