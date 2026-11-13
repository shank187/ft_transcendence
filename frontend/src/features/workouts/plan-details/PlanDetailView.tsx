import { useEffect, useState } from "react"
import type {PlanDay, PlanDetail} from "../shared/workouts.types"
import { getPlanDetails } from "../shared/get-plan-details"
import { MAX_DAYS_PER_PLAN } from "../shared/limits"
import LoadingState from "../../../components/states/LoadingState"
import ErrorState from "../../../components/states/ErrorState"
import EmptyState from "../../../components/states/EmptyState"
import emptyStateIcon from "../../../assets/empty-icon.png"
import Button from "../../../components/ui/Button"
import PlanHeader from "./PlanHeader"
import DayRow from "./DayRow"
import AddDayForm from "./AddDayForm"
import RenameDayDialog from "./RenameDayDialog"
import DeleteDayDialog from "./DeleteDayDialog"
import NotFoundState from "../../../components/states/NotFoundState"
import { Link } from "react-router-dom"
import { buttonClasses } from "../../../components/ui/button-classes"

export default function PlanDetailView(props: {planId: string})
{
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string|null>(null)
    const [plan, setPlan] = useState<PlanDetail|null>(null)
    const [reloadCount, setReloadCount] = useState(0)

    const [addDayForm, setAddDayVisibility] = useState(false)

    const [dayMenu, setDayMenu] = useState<string | null>(null)
    
    const [renamingDayId, setRenamingDayId] = useState<string | null>(null)

    const[deletingDayId, setdeletingDayId] = useState<string|null>(null)

    const closeRename = () => {
        setRenamingDayId(null)
    }
    const closeDayDelete = () =>{
        setdeletingDayId(null)
    }

    const addDayToPlan = (createdDay: PlanDay) => {
        setPlan(previous =>
                previous
                ? {...previous, days: [...previous.days, createdDay]}
                :previous
        )
    }
    const renameDayInPlan = (renamedDay: PlanDay) => {
        setPlan(previous => previous
            ? { ...previous, days: previous.days.map(d => d.id === renamedDay.id ? renamedDay : d) }
            : previous)
    }
    const replacePlanDays = (remainingDays: PlanDay[]) => {
        setPlan(previous => previous 
            ?{...previous, days: remainingDays}
            : previous )
    }
    const renamePlanInPage = (renamedPlan: PlanDetail) => {
        setPlan(previous => previous
            ? { ...previous, name: renamedPlan.name, description: renamedPlan.description }
            : previous)
    }

    const reloadPlan = () => {
        setError(null)
        setLoading(true)
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
                setPlan(result)
            }catch(err){
                if (ignore) return
                setError(err instanceof(Error) ? err.message : "Failed to load page, try again.")
            }finally{
                if (!ignore) setLoading(false)
            }
        }
        void loadPlan()
        return () => { ignore = true }
    },[props.planId, reloadCount])

    if(loading) return <LoadingState message="Loading plan detail..."/>
    if(error)
        return(
            <ErrorState
            message={error}
            action={<Button
                    onClick={reloadPlan}
                    >
                Retry
                </Button>}
            />
        )
    if(!plan)
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

    const renamingDay = plan.days.find(d => d.id === renamingDayId)
    const deletingDay = plan.days.find(d => d.id === deletingDayId)

    return(
        <div className="space-y-5">
            <PlanHeader
            planId={props.planId}
            name={plan.name}
            description={plan.description}
            onRenamed={renamePlanInPage}
            />
            {plan.days.length === 0 && !addDayForm && (
                <EmptyState
                icon={
                    <img
                    src={emptyStateIcon}
                    alt=""
                    className="w-32"
                    />
                }
                title="No days yet"
                description="Add your first day to start planning."
                action={<Button
                            className="m-5"
                            onClick={()=>setAddDayVisibility(true)}
                        >
                    Add day
                </Button>}
                />
            )}
            {plan.days.length > 0 && (<h2 className="text-lg font-semibold">Days · {plan.days.length}/7</h2>)}
            {plan.days.length > 0 && (
                <ol className="flex flex-col gap-3">
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
                    onAdded={addDayToPlan}
                    onClose={() => setAddDayVisibility(false)}
                />
            }
            {plan.days.length > 0 && plan.days.length < MAX_DAYS_PER_PLAN && !addDayForm &&
                <Button 
                    onClick={()=>setAddDayVisibility(true)}
                    variant="primary"
                >
                    Add day
                </Button>
            }
            {plan.days.length >= MAX_DAYS_PER_PLAN && (<p>{`A plan can have at most ${MAX_DAYS_PER_PLAN} days.`}</p>)}
            {renamingDay && (
                <RenameDayDialog
                    planId={props.planId}
                    day={renamingDay}
                    onClose={closeRename}
                    onRenamed={renameDayInPlan}
                />
            )}
            {deletingDay && (
                <DeleteDayDialog
                    planId={props.planId}
                    day={deletingDay}
                    onClose={closeDayDelete}
                    onDeleted={replacePlanDays}
                />
            )}
        </div>
    )
} 