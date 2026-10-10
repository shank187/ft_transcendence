import type { ReactNode } from "react";


interface EmptyStateProps{
    title: string,
    description?: string,
    action?: ReactNode,
    icon?: ReactNode,
}

export default function EmptyState({
    title,
    description,
    icon,
    action
}: EmptyStateProps)
{
    return(
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
            {icon}
            <h2>{title}</h2>
            {description && 
                (<p>{description}</p>
            )}
            {action}
        </div>
    )
}