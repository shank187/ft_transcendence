import { Check } from "lucide-react"
import type { ExerciseItem } from "./exercise.types"
import { EXERCISE_TYPE_LABEL } from "../exercise-fields"
import exercisePlaceholder from "../../../../assets/exercise-placeholder.svg"

interface ExerciseRowProps {
    exercise: ExerciseItem
    onToggle: (exercise: ExerciseItem, isSelected: boolean) => void
    isSelected: boolean
    // The user's current gym from the filters response; null when there is none.
    gymName: string | null
    // Already in the day or workout being edited, e.g. "In this day". It can still be added again.
    addedLabel: string | null
}

export default function ExerciseRow({ exercise, onToggle, isSelected, gymName, addedLabel }: ExerciseRowProps)
{
    // "Chest · Dumbbells, Bench · Weight + reps"; no equipment means a bodyweight exercise.
    const equipment = exercise.equipment.length > 0 ? exercise.equipment.join(", ") : "Bodyweight"
    const meta = `${exercise.primaryMuscle} · ${equipment} · ${EXERCISE_TYPE_LABEL[exercise.type]}`
    const notAtGym = exercise.availableAtGym === false

    return (
        <button
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(exercise, isSelected)}
            className="flex min-h-15 w-full items-center gap-3 rounded-xl p-2 text-left hover:bg-app-surface-hover aria-pressed:bg-app-primary/8"
        >
            <img
                src={exercise.imageUrl ?? exercisePlaceholder}
                alt=""
                className="size-11 shrink-0 rounded-lg bg-app-surface-raised object-cover"
            />
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                <span className="truncate text-sm font-semibold">{exercise.name}</span>
                <span className="truncate text-xs text-app-text-secondary">{meta}</span>
                {(notAtGym || addedLabel) &&
                    <span className="flex flex-wrap gap-1.5">
                        {notAtGym &&
                            <span className="rounded-full bg-app-surface-hover px-2 text-[11px] font-semibold text-app-text-secondary">{`Not at ${gymName ?? "your gym"}`}</span>
                        }
                        {addedLabel &&
                            <span className="rounded-full bg-app-primary/10 px-2 text-[11px] font-semibold text-app-primary">{addedLabel}</span>
                        }
                    </span>
                }
            </span>
            <span
                aria-hidden="true"
                className={`flex size-6 shrink-0 items-center justify-center rounded-full border-2 ${isSelected ? "border-app-primary bg-app-primary text-app-canvas" : "border-app-border"}`}
            >
                {isSelected && <Check className="size-3.5" strokeWidth={3.5} />}
            </span>
        </button>
    )
}
