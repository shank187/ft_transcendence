import { useEffect, useRef } from "react";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import DropDownMenu from "../../components/ui/DropdownMenu";
import type { PlanDay } from "./plan-detail.types";
import { Link } from "react-router-dom";
import { buttonClasses } from "../../components/ui/button-classes";



export default function DayRow(
    props:{
        day: PlanDay,
        planId: string,
        dropDownMenu: string|null,
        setDropDown: (Daymenu: string | null)=> void
        onRename: (day: PlanDay) => void
        onDelete: (day: PlanDay) => void
    }
){

    const day = props.day;
    const exercises = `${day.exerciseCount} ${day.exerciseCount === 1 ? "exercise" : "exercises"}`;
    const sets = `${day.setCount} ${day.setCount === 1 ? "set" : "sets"}`;

    const menuWrapper = useRef<HTMLDivElement>(null);
    const isMenuOpen = props.dropDownMenu === day.id;
    const { setDropDown } = props;

    // close the menu on a press outside the ⋮ button and the menu
    useEffect(() => {
        if (!isMenuOpen) return;

        const closeOnOutsidePress = (event: PointerEvent) => {
            const wrapper = menuWrapper.current;
            if (wrapper && !wrapper.contains(event.target as Node)) {
                setDropDown(null);
            }
        };

        document.addEventListener("pointerdown", closeOnOutsidePress);

        return () => {
            document.removeEventListener("pointerdown", closeOnOutsidePress);
        };
    }, [isMenuOpen, setDropDown]);

    return (
        <Card className="flex flex-col gap-3">
            <div className="flex flex-row items-start justify-between">
                <div className="min-w-0 wrap-break-word">
                    <h3>Day {day.dayOrder} · {day.name}</h3>
                    <p>{day.exerciseCount > 0 ? `${exercises} · ${sets}` : "No exercises yet"}</p>
                </div>
                <div ref={menuWrapper} className="relative">
                    <Button
                        variant="ghost"
                        aria-label={`Actions for ${day.name}`}
                        aria-expanded={isMenuOpen}
                        onClick={() =>
                            props.setDropDown(isMenuOpen ? null : day.id)
                        }
                    >
                        ⋮
                    </Button>
                    {isMenuOpen && (
                    <div className="absolute right-0 top-full z-10 mt-1 rounded-md border border-app-border bg-app-surface-raised p-1">
                        <DropDownMenu
                            actions={[
                                { id: `rename-${day.id}`, label: "Rename", onSelect: () => props.onRename(day) },
                                { id: `delete-${day.id}`, label: "Delete", onSelect: () => props.onDelete(day), danger: true },
                            ]}
                            onClose={()=>props.setDropDown(null)}
                        />
                    </div>
                    )}
                </div>
            </div>
            <div className="flex items-center gap-2">
                <Link
                    to={`/workouts/plans/${props.planId}/days/${day.id}`}
                    className={buttonClasses("secondary", "border border-app-border flex-1 min-h-11")}
                >
                    Edit
                </Link>
                {/* TODO(UI 5/7): start a workout from this day */}
                <Button variant="primary" className="flex-1 min-h-11" disabled>
                    ▶ Start
                </Button>
            </div>
        </Card>
    );
}
