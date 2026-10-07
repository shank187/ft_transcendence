import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DropDownMenu from "../../components/ui/DropdownMenu";
import type { PlanDay } from "./plan-detail.types";




export default function DayRow(
    props:{
        day: PlanDay,
        dropDownMenu: string|null,
        setDropDown: (Daymenu: string | null)=> void
        onRename: (day: PlanDay) => void
        onDelete: (day: PlanDay) => void 
    }
){


    const day = props.day;
    const exercises = `${day.exerciseCount} ${day.exerciseCount === 1 ? "exercise" : "exercises"}`;
    const sets = `${day.setCount} ${day.setCount === 1 ? "set" : "sets"}`;

    return (
        <Card >
        <h3>Day {day.dayOrder} · {day.name}</h3>
        <p>{day.exerciseCount > 0 ? `${exercises} · ${sets}` : "No exercises yet"}</p>
        <Button
            variant="ghost"
            aria-label={`Actions for ${day.name}`}
            aria-expanded={props.dropDownMenu === day.id}
            onClick={() =>
                props.setDropDown(
                props.dropDownMenu === day.id ? null : day.id
                )
            }
        >
            ⋮
        </Button>
        {props.dropDownMenu === day.id && (
        <DropDownMenu actions={[
            { id: `rename-${day.id}`, label: "Rename", onSelect: () => props.onRename(day) },
            { id: `delete-${day.id}`, label: "Delete", onSelect: () => props.onDelete(day), danger: true },
        ]} />
        )}
        </Card>
    );
}