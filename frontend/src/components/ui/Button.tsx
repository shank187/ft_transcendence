import type {
    ButtonHTMLAttributes,
    ReactNode,
} from 'react'

const variantClasses = {
    primary:
        'bg-app-primary text-app-canvas hover:brightness-110',

    secondary:
        'bg-app-surface text-app-text hover:brightness-125',

    ghost:
        'bg-transparent text-app-text hover:bg-app-surface',
} as const

type ButtonVariant = keyof typeof variantClasses

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: ButtonVariant
}

function Button({
    children,
    variant = 'primary',
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

                transition-all duration-150 ease-out
                hover:-translate-y-0.5
                active:translate-y-0

                ${variantClasses[variant]}

                focus-visible:outline-none
                focus-visible:ring-2
                focus-visible:ring-app-primary
                focus-visible:ring-offset-2

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