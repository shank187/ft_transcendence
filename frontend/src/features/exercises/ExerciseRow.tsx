import type { Exercise } from "./exercise.types"
import { EXERCISE_TYPE_LABEL } from "../day-editor/exercise-fields"
import exercisePlaceholder from "../../assets/exercise-placeholder.svg"

interface ExerciseRowProps {
    exercise: Exercise
    onToggle: (exercise: Exercise, isSelected: boolean) => void
    isSelected: boolean
}

export default function ExerciseRow({ exercise, onToggle, isSelected }: ExerciseRowProps) {
    // "Chest · Dumbbells, Bench · Weight + reps"; no equipment means a bodyweight exercise.
    const equipment = exercise.equipment.length > 0 ? exercise.equipment.join(", ") : "Bodyweight"
    const meta = `${exercise.primaryMuscle} · ${equipment} · ${EXERCISE_TYPE_LABEL[exercise.type]}`

    return (
        <button
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(exercise, isSelected)}
            className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-app-surface-hover aria-pressed:bg-app-surface-hover"
        >
            <img
                src={exercise.imageUrl ?? exercisePlaceholder}
                alt=""
                className="size-12 shrink-0 rounded-md object-cover"
            />
            <span className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-medium text-app-text">{exercise.name}</span>
                <span className="truncate text-xs text-app-text-muted">{meta}</span>
            </span>
            <span
                aria-hidden="true"
                className={`ml-auto flex size-[22px] shrink-0 items-center justify-center rounded-full border text-xs ${
                    isSelected ? "border-app-primary bg-app-primary text-app-canvas" : "border-app-border"
                }`}
            >
                {isSelected && "✓"}
            </span>
        </button>
    )
}