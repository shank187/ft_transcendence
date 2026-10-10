import { useState } from "react"
import type { DayDetail } from "./day-editor.types"

export default function DayEditorView(props:{planId: string, dayId: string})
{
    const [dayDetail, setDayDetail] = useState<DayDetail| null>(null)
    
    
    return(
        <div>
            Edit your day plan :{props.planId} day: {props.dayId}.
        </div>
    )
}