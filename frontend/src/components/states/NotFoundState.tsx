import type { ReactNode } from "react";
import notFoundIcon from "../../assets/404-icon.png"

interface NotFoundStateProps{
    title: string,
    description?: string,
    action?: ReactNode,
}

export default function NotFoundState({
    title,
    description,
    action
}: NotFoundStateProps)
{
    return(
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
            <img src={notFoundIcon} alt="" className="w-32"/>
            <h2>{title}</h2>
            {description &&
                (<p>{description}</p>
            )}
            {action}
        </div>
    )
}
