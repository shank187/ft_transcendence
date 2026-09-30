import type { ReactNode } from "react";

interface ErrorStateProps{
    message: string,
    action?: ReactNode,
}


export default function ErrorState({message, action}:ErrorStateProps)
{
    return(
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
            <h1>{message}</h1>
            {action}
        </div>
    )
}