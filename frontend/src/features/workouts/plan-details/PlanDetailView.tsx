import { useEffect, useReducer, useState } from "react"
import { CalendarPlus, Plus } from "lucide-react"
import { getPlanDetails } from "../shared/get-plan-details"
import { MAX_DAYS_PER_PLAN } from "../shared/limits"
import LoadingState from "../../../components/states/LoadingState"
import ErrorState from "../../../components/states/ErrorState"
import Button from "../../../components/ui/Button"
import PlanHeader from "./PlanHeader"
import DayRow from "./DayRow"
import AddDayForm from "./AddDayForm"
import RenameDayDialog from "./RenameDayDialog"
import DeleteDayDialog from "./DeleteDayDialog"
import NotFoundState from "../../../components/states/NotFoundState"
import { Link } from "react-router-dom"
import { buttonClasses } from "../../../components/ui/button-classes"
import { planReducer } from "./plan-details.reducer"

interface PlanDetailViewProps {
    planId: string
}

export default function PlanDetailView(props: PlanDetailViewProps)
{
    const [state, dispatch] = useReducer(planReducer, { status: "loading" })
    const [reloadCount, setReloadCount] = useState(0)
    const [addDayForm, setAddDayVisibility] = useState(false)
    const [dayMenu, setDayMenu] = useState<string | null>(null)
    const [renamingDayId, setRenamingDayId] = useState<string | null>(null)
    const [deletingDayId, setdeletingDayId] = useState<string|null>(null)

    const closeRename = () => {
        setRenamingDayId(null)
    }
    const closeDayDelete = () =>{
        setdeletingDayId(null)
    }

    const reloadPlan = () => {
        dispatch({ type: "reloading" })
        setReloadCount(count => count + 1)
    }

    // The load lives inside the effect so its cleanup can ignore an answer for an
    // older planId or an older reload.
    useEffect(()=>{
        let ignore = false
        const loadPlan = async () => {
            try{
                const result = await getPlanDetails(props.planId)
                if (ignore) return
                dispatch(result ? { type: "loaded", plan: result } : { type: "notFound" })
            }catch(err){
                if (ignore) return
                dispatch({ type: "loadFailed", message: err instanceof(Error) ? err.message : "Failed to load page, try again." })
            }
        }
        void loadPlan()
        return () => { ignore = true }
    },[props.planId, reloadCount])

    if(state.status === "loading") return <LoadingState message="Loading plan detail..."/>
    if(state.status === "error")
        return(
            <ErrorState
            message={state.message}
            action={<Button className="min-h-11" onClick={reloadPlan}>Retry</Button>}
            />
        )
    if(state.status === "notFound")
        return(
            <NotFoundState
            title="Plan not found."
            description="It may have been deleted."
            action={<Link
                    to="/workouts"
                    className={buttonClasses("secondary", "mt-4 min-h-11")}
                    >
                Back to my plans
                </Link>}
            />
        )

    const { plan } = state
    const renamingDay = plan.days.find(d => d.id === renamingDayId)
    const deletingDay = plan.days.find(d => d.id === deletingDayId)

    const canAddDay = plan.days.length < MAX_DAYS_PER_PLAN

    return(
        <div className="mx-auto flex max-w-[880px] flex-col gap-5 md:gap-6">
            <PlanHeader
            planId={props.planId}
            name={plan.name}
            description={plan.description}
            onRenamed={renamed => dispatch({ type: "planRenamed", plan: renamed })}
            />
            <section className="flex flex-col gap-3">
                <h2 className="text-lg font-semibold md:text-xl">
                    Days <span className="text-sm font-normal text-app-text-muted md:text-[15px]">{plan.days.length}</span>
                </h2>
                {plan.days.length === 0 && !addDayForm && (
                    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-app-border bg-app-surface px-6 py-10 text-center">
                        <span className="flex size-16 items-center justify-center rounded-full bg-app-primary/10 text-app-primary">
                            <CalendarPlus aria-hidden="true" className="size-7.5" strokeWidth={1.75} />
                        </span>
                        <strong className="text-lg font-semibold">No days yet</strong>
                        <p className="max-w-70 text-sm text-app-text-secondary">Add your first day to start planning.</p>
                        <Button className="mt-1 min-h-12 gap-2 font-bold" onClick={() => setAddDayVisibility(true)}>
                            <Plus aria-hidden="true" className="size-4.5" strokeWidth={2.5} />
                            Add day
                        </Button>
                    </div>
                )}
                {plan.days.length > 0 && (
                    <ol className="flex flex-col gap-2.5">
                        { [...plan.days]
                        .sort((a, b) => a.dayOrder - b.dayOrder)
                        .map(day => (
                            <li key={day.id}>
                                <DayRow
                                day={day}
                                planId={props.planId}
                                dropDownMenu={dayMenu}
                                setDropDown={setDayMenu}
                                onRename={selectedDay => {
                                    setDayMenu(null)
                                    setRenamingDayId(selectedDay.id)
                                }}
                                onDelete={selectedDay => {
                                    setDayMenu(null)
                                    setdeletingDayId(selectedDay.id)
                                }}
                                />
                            </li>
                        ))}
                    </ol>
                )}
                {addDayForm &&
                    <AddDayForm
                        planId={props.planId}
                        dayCount={plan.days.length}
                        onAdded={day => dispatch({ type: "dayAdded", day })}
                        onClose={() => setAddDayVisibility(false)}
                    />
                }
                {plan.days.length > 0 && canAddDay && !addDayForm &&
                    <button type="button" onClick={() => setAddDayVisibility(true)} className="flex h-13 items-center justify-center gap-2 rounded-2xl border border-dashed border-app-border text-[15px] font-semibold text-app-text-secondary hover:border-app-primary hover:text-app-primary md:h-14">
                        <Plus aria-hidden="true" className="size-4.5" strokeWidth={2.5} />
                        Add day
                    </button>
                }
                {!canAddDay && <p className="text-sm text-app-text-secondary">{`A plan can have at most ${MAX_DAYS_PER_PLAN} days.`}</p>}
            </section>
            {renamingDay && (
                <RenameDayDialog
                    planId={props.planId}
                    day={renamingDay}
                    onClose={closeRename}
                    onRenamed={day => dispatch({ type: "dayRenamed", day })}
                />
            )}
            {deletingDay && (
                <DeleteDayDialog
                    planId={props.planId}
                    day={deletingDay}
                    onClose={closeDayDelete}
                    onDeleted={days => dispatch({ type: "daysReplaced", days })}
                />
            )}
        </div>
    )
} 