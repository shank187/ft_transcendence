import type { PlanDay, PlanDetail } from "../shared/workouts.types"

export type PlanState =
    | { status: "loading" }
    | { status: "error", message: string }
    | { status: "notFound" }
    | { status: "success", plan: PlanDetail }

// Each action stores what the API returned.
export type PlanAction =
    | { type: "loaded", plan: PlanDetail }
    | { type: "notFound" }
    | { type: "loadFailed", message: string }
    | { type: "reloading" }
    | { type: "planRenamed", plan: PlanDetail }
    | { type: "dayAdded", day: PlanDay }
    | { type: "dayRenamed", day: PlanDay }
    // Deleting a day renumbers the others, so the server sends back every remaining day.
    | { type: "daysReplaced", days: PlanDay[] }

export function planReducer(state: PlanState, action: PlanAction): PlanState
{
    switch (action.type) {
        case "loaded":
            return { status: "success", plan: action.plan }
        case "notFound":
            return { status: "notFound" }
        case "loadFailed":
            return { status: "error", message: action.message }
        case "reloading":
            return { status: "loading" }
    }

    if (state.status !== "success")
        return state
    const { plan } = state

    switch (action.type) {
        case "planRenamed":
            return { ...state, plan: { ...plan, name: action.plan.name, description: action.plan.description } }
        case "dayAdded":
            return { ...state, plan: { ...plan, days: [...plan.days, action.day] } }
        case "dayRenamed":
            return { ...state, plan: { ...plan, days: plan.days.map(d => d.id === action.day.id ? action.day : d) } }
        case "daysReplaced":
            return { ...state, plan: { ...plan, days: action.days } }
    }
}
