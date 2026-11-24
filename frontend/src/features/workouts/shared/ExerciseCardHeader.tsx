import type { ReactNode } from "react"
import type { ExerciseSummary } from "./workouts.types"
import { EXERCISE_TYPE_LABEL } from "./exercise-fields"
import exercisePlaceholder from "../../../assets/exercise-placeholder.svg"

interface ExerciseCardHeaderProps {
    position: number
    exercise: ExerciseSummary
    // After type · muscle, e.g. "2 / 4 sets" during a workout.
    progress?: string
    // On the right, e.g. the workout's move buttons. Wraps under the name when space runs out.
    aside?: ReactNode
}

export default function ExerciseCardHeader(props: ExerciseCardHeaderProps)
{
    const { exercise } = props

    return (
        <div className="flex flex-wrap items-center gap-2.5">
            {/* alt="" because the name right next to it already says what it is */}
            <img src={exercise.imageUrl ?? exercisePlaceholder} alt="" className="size-10 shrink-0 rounded-lg bg-app-surface-hover object-cover" />
            <div className="flex min-w-0 flex-[1_1_8rem] flex-col gap-0.5">
                <h2 className="font-semibold wrap-break-word">
                    <span className="tabular-nums text-app-text-muted">{props.position}.</span> {exercise.name}
                </h2>
                <p className="text-[13px] text-app-text-secondary">
                    {EXERCISE_TYPE_LABEL[exercise.type]} · {exercise.primaryMuscle}
                    {props.progress && <> · <span className="whitespace-nowrap tabular-nums text-app-primary">{props.progress}</span></>}
                </p>
            </div>
            {props.aside}
        </div>
    )
}
