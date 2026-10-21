import type { ReactNode } from "react";
import errorIcon from "../../assets/error-icon.png"

interface ErrorStateProps{
    message: string,
    action?: ReactNode,
}


export default function ErrorState({message, action}:ErrorStateProps)
{
    return(
        <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
            <img src={errorIcon} alt="" className="w-32"/>
            <h1 className="mb-5">{message}</h1>
            {action}
        </div>
    )
}