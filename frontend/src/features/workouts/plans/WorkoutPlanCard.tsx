import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import type { WorkoutPlan } from "./plans.types";

interface WorkoutPlanCardProps
{
    workout: WorkoutPlan
}

export default function WorkoutPlanCard(props: WorkoutPlanCardProps)
{
    const { workout } = props
    const daysLabel = `${workout.days} ${workout.days === 1 ? "day" : "days"}`

    return(
        <li>
            <Link
            to={`/workouts/plans/${workout.id}`}
            className="flex h-full items-center gap-3.5 rounded-2xl border border-app-border bg-app-surface p-4 hover:border-app-text-muted md:min-h-42 md:flex-col md:items-stretch md:gap-2.5 md:p-5"
            >
                <span className="flex min-w-0 flex-1 flex-col gap-1.5 md:flex-none md:gap-2.5">
                    <span className="flex items-center gap-2 md:justify-between">
                        <strong className="truncate font-semibold md:text-lg">{workout.name}</strong>
                        <span className="shrink-0 rounded-full bg-app-surface-hover px-2 py-0.5 text-xs font-semibold text-app-text-secondary md:px-2.5">{daysLabel}</span>
                    </span>
                    {workout.description &&
                        <span className="line-clamp-2 text-[13px] leading-snug text-app-text-secondary md:text-sm">{workout.description}</span>
                    }
                </span>
                <ChevronRight aria-hidden="true" className="size-5 shrink-0 text-app-text-muted md:hidden" />
                <span aria-hidden="true" className="mt-auto hidden items-center gap-1 text-sm font-semibold text-app-primary md:flex">
                    Open plan
                    <ChevronRight className="size-4" />
                </span>
            </Link>
        </li>
    )
}
