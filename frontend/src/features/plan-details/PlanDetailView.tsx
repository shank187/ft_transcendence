import {useCallback, useEffect, useState} from "react"
import type {PlanDay, PlanDetail} from "./plan-detail.types"
import getPlanDetails from "./plan-detail.api"
import LoadingState from "../../components/states/LoadingState"
import ErrorState from "../../components/states/ErrorState"
import Button from "../../components/ui/Button"
import PlanHeader from "./PlanHeader"
import DayRow from "./DayRow"
import AddDayForm from "./AddDayForm"
import RenameDayDialog from "./RenameDayDialog"
import DeleteDayDialog from "./DeleteDayDialog"

export default function PlanDetailView(props: {planId: string})
{
    // plan details page
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string|null>(null)
    const [plan, setPlan] = useState<PlanDetail|null>(null)

    //form for creating a day
    const [addDayForm, setAddDayVisibility] = useState(false)

    // menu for renaming/deleting a day
    const [dayMenu, setDayMenu] = useState<string | null>(null)
    
    //rename day
    const [renamingDayId, setRenamingDayId] = useState<string | null>(null)

    //delete day 
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

    const loadPlan = useCallback( async ()=>{
        setError(null)
        setLoading(true)
        try{
            setPlan(await getPlanDetails(props.planId))
        }catch(err){
            setError(err instanceof(Error) ? err.message : "Failed to load page, try again.")
        }finally{
            setLoading(false)
        }
    }, [props.planId])

    useEffect(()=>{
        loadPlan();
    },[loadPlan])

    if(loading) return <LoadingState message="Loading plan detail..."/>
    if(error)
        return(
            <ErrorState
            message={error}
            action={<Button
                    onClick={() => void loadPlan()}
                    >
                Retry
                </Button>}
            />
        )
    if(!plan) return <h1>Plan not found.</h1>

    const renamingDay = plan.days.find(d => d.id === renamingDayId)
    const deletingDay = plan.days.find(d => d.id === deletingDayId)

    return(
        <div>
            <PlanHeader
            name={plan.name}
            description={plan.description}
            type={plan.type}
            dayCount={plan.days.length}
            />
            {plan.days.length === 0 ? (
                <p>no Workout day Yet.</p>
            ) : (
                <ol className="flex flex-col gap-3">
                    { [...plan.days]
                    .sort((a, b) => a.dayOrder - b.dayOrder)
                    .map(day => (
                        <li key={day.id}>
                            <DayRow
                            day={day}
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
            )
            }
            {addDayForm &&
                <AddDayForm
                    planId={props.planId}
                    dayCount={plan.days.length}
                    onAdded={addDayToPlan}
                    onClose={() => setAddDayVisibility(false)}
                />
            }
            {plan.days.length < 7 && !addDayForm &&     
                <Button 
                    onClick={()=>setAddDayVisibility(true)}
                    variant="primary"
                >
                    Add day
                </Button>
            }
            {plan.days.length >= 7 && (<p>A plan can contain at most 7 days.</p>)}
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