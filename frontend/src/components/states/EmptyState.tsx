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
    action
}: EmptyStateProps)
{
    return(
        <div >
            <h2>{title}</h2>

            {description && 
                (<p>{description}</p>
            )}

            {action}
        </div>
    )
}