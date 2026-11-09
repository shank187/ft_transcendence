import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";

export default function FinishingDialog(props: {
    onClose: () => void,
    onFinish : () => void,
    saving : boolean,
    error : null| string,
})
{

    return(
        <Dialog onClose={props.onClose} title="Incompleted Sets" isWorking={props.saving} >
            <div>
                <h2> you have Some incompleted sets, want continue saving? </h2>
                {props.error && <p className="text-app-danger">{props.error}</p>}
                <div>
                    <Button onClick={()=> props.onFinish()} disabled={props.saving}>save</Button>
                    <Button variant="secondary" disabled={props.saving} onClick={() => props.onClose()}>keep training</Button>
                </div>
            </div>
        </Dialog>
    )
}