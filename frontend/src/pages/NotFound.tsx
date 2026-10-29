import { Link } from "react-router-dom"
import NotFoundState from "../components/states/NotFoundState"
import { buttonClasses } from "../components/ui/button-classes"

export default function NotFound()
{
    return(
        <NotFoundState
        title="Page not found."
        description="This address does not exist."
        action={<Link
                to="/home"
                className={buttonClasses("secondary", "mt-4 min-h-11")}
                >
            Back to home
            </Link>}
        />
    )
}
