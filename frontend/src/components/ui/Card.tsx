import type {
    ReactNode,
    HTMLAttributes
} from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement>{
    children: ReactNode
}

function Card({
    children,
    className = '',
    ...props
}: CardProps)
{
return(
        <div
            className={`
                rounded-xl
                bg-app-surface
                text-app-text
                p-4
                ${className}
            `}
            {...props}
        >
            {children}
        </div>
    )
}

export default Card
