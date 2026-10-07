import Button from "./Button";

interface MenuAction{
    id: string,
    label: string,
    onSelect: () => void,
    danger ?: boolean,
}


export default function DropDownMenu(props: {actions: MenuAction[]})
{
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