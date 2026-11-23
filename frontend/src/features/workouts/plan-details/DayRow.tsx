import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { EllipsisVertical, Pencil, Plus } from "lucide-react";
import DropDownMenu from "../../../components/ui/DropdownMenu";
import type { PlanDay } from "../shared/workouts.types";
import StartDayButton from "../shared/StartDayButton";

interface DayRowProps {
    day: PlanDay
    planId: string
    dropDownMenu: string | null
    setDropDown: (dayMenu: string | null) => void
    onRename: (day: PlanDay) => void
    onDelete: (day: PlanDay) => void
}

const outlineLinkClasses = "flex h-11 shrink-0 items-center justify-center gap-2 rounded-lg border text-sm font-semibold"

export default function DayRow(props: DayRowProps)
{
    const menuWrapper = useRef<HTMLDivElement>(null);

    const { day, setDropDown } = props;
    const isMenuOpen = props.dropDownMenu === day.id;
    const editUrl = `/workouts/plans/${props.planId}/days/${day.id}`;
    const exercises = `${day.exerciseCount} ${day.exerciseCount === 1 ? "exercise" : "exercises"}`;
    const sets = `${day.setCount} ${day.setCount === 1 ? "set" : "sets"}`;

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
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-app-border bg-app-surface p-3.5 md:gap-4 md:px-5 md:py-4">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-app-surface-hover text-sm font-bold text-app-text-secondary md:size-10 md:text-[15px]">
                {day.dayOrder}
            </span>
            {/* flex-basis 8rem: on a narrow phone the buttons wrap under the name instead of squeezing it. */}
            <div className="flex min-w-0 flex-[1_1_8rem] flex-col gap-0.5">
                <h3 className="truncate font-semibold md:text-[17px]">{day.name}</h3>
                <p className="text-[13px] text-app-text-secondary md:text-sm">{day.exerciseCount > 0 ? `${exercises} · ${sets}` : "No exercises yet"}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
                {day.exerciseCount > 0
                    ? <>
                        <Link to={editUrl} aria-label={`Edit ${day.name}`} className={`${outlineLinkClasses} w-11 border-app-border hover:bg-app-surface-hover md:w-auto md:px-3.5`}>
                            <Pencil aria-hidden="true" className="size-4" />
                            <span className="hidden md:inline">Edit</span>
                        </Link>
                        <StartDayButton dayId={day.id} />
                    </>
                    : <Link to={editUrl} className={`${outlineLinkClasses} border-app-primary px-3.5 text-app-primary hover:bg-app-primary/10`}>
                        <Plus aria-hidden="true" className="size-4" strokeWidth={2.5} />
                        Add exercises
                    </Link>
                }
                <div ref={menuWrapper} className="relative">
                    <button
                    type="button"
                    aria-label={`Actions for ${day.name}`}
                    aria-expanded={isMenuOpen}
                    onClick={() => setDropDown(isMenuOpen ? null : day.id)}
                    className="flex size-11 items-center justify-center rounded-lg text-app-text-secondary hover:bg-app-surface-hover hover:text-app-text"
                    >
                        <EllipsisVertical aria-hidden="true" className="size-5" />
                    </button>
                    {isMenuOpen && (
                    <div className="absolute right-0 top-full z-10 mt-1 rounded-xl border border-app-border bg-app-surface-raised p-1.5 shadow-2xl shadow-black/50">
                        <DropDownMenu
                            actions={[
                                { id: `rename-${day.id}`, label: "Rename", onSelect: () => props.onRename(day) },
                                { id: `delete-${day.id}`, label: "Delete", onSelect: () => props.onDelete(day), danger: true },
                            ]}
                            onClose={() => setDropDown(null)}
                        />
                    </div>
                    )}
                </div>
            </div>
        </div>
    );
}
