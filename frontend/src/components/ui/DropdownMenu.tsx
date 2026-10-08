import { useEffect } from "react";
import Button from "./Button";

interface MenuAction{
    id: string,
    label: string,
    onSelect: () => void,
    danger ?: boolean,
}


export default function DropDownMenu(props:{
    actions: MenuAction[],
    onClose: ()=> void,
})
{
    useEffect(() => {
        const handleKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") {
                props.onClose();
            }
        };

        document.addEventListener("keydown", handleKey);

        return () => {
            document.removeEventListener("keydown", handleKey);
        };
    }, [props.onClose]);

    return(
        <menu>
            {props.actions.map( action =>
                <li key={action.id}>
                    <Button
                    variant="ghost"
                    onClick={action.onSelect}
                    >
                        <span className={action.danger ? "text-app-danger" : ""}>
                            {action.label}
                        </span>
                    </Button>
                </li>
            )}
        </menu>
    )
}