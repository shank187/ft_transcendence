import Card from "../../components/ui/Card";
import type { planDay } from "./plan-detail.types";




export default function DayRow(props: { day: planDay}) {
    const day = props.day;
    const exercises = `${day.exerciseCount} ${day.exerciseCount === 1 ? "exercise" : "exercises"}`;
    const sets = `${day.setCount} ${day.setCount === 1 ? "set" : "sets"}`;

    return (
        <Card>
        <h3>Day {day.dayOrder} · {day.name}</h3>
        <p>{day.exerciseCount > 0 ? `${exercises} · ${sets}` : "No exercises yet"}</p>
        </Card>
    );
}