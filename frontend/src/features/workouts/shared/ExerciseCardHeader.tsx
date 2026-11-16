import type { ReactNode } from "react"
import type { ExerciseSummary } from "./workouts.types"
import { EXERCISE_TYPE_LABEL } from "./exercise-fields"
import exercisePlaceholder from "../../../assets/exercise-placeholder.svg"

// The top of an exercise card in the day editor and in the workout:
// position, image, name, then "type · muscle".
export default function ExerciseCardHeader(props: {
    position: number
    exercise: ExerciseSummary
    // Next to "type · muscle", e.g. the day editor's rest box.
    metaExtra?: ReactNode
    // Under the name block, e.g. the rest error.
    children?: ReactNode
    // On the right, e.g. the workout's move buttons.
    aside?: ReactNode
})
{
    const { exercise } = props
    return (
        <div className="flex items-start gap-3">
            <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-app-surface-hover text-[13px] font-semibold">{props.position}</div>
            {/* alt="" because the name right next to it already says what it is */}
            <img src={exercise.imageUrl ?? exercisePlaceholder} alt="" className="size-10 shrink-0 rounded-md object-cover" />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <h2 className="font-semibold wrap-break-word">{exercise.name}</h2>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5">
                    <p className="text-[13px] text-app-text-muted">{EXERCISE_TYPE_LABEL[exercise.type]} · {exercise.primaryMuscle}</p>
                    {props.metaExtra}
                </div>
                {props.children}
            </div>
            {props.aside}
        </div>
    )
}
