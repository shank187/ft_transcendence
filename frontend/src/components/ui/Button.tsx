import type {
    ButtonHTMLAttributes,
    ReactNode,
} from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
}

function Button({
    children,
    className = '',
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={`
                inline-flex items-center justify-center
                rounded-md
                px-4 py-2
                text-sm font-medium
                transition
                disabled:cursor-not-allowed
                disabled:opacity-50
                ${className}
            `}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button