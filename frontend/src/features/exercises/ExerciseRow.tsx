import Button from "../../components/ui/Button";
import type { Exercise } from "./exercise.types"

interface ExerciseRowProps
{
    exercise: Exercise,
    onToggle: (exercise: Exercise)=> void;
    isSelected: boolean;
}

export default function ExerciseRow(props: ExerciseRowProps)
{
    return(
        <Button
            aria-pressed= {props.isSelected}
            className= {props.isSelected ? "border border-app-primary" :"border border-app-border"}
            variant="ghost"
            onClick={()=>props.onToggle(props.exercise)}
        >
                {props.isSelected && "✓"} {props.exercise.name} - {props.exercise.primaryMuscle}
        </Button>
    )
}