import type {
    ButtonHTMLAttributes,
    ReactNode,
} from 'react'
import { buttonClasses, type ButtonVariant } from './button-classes'

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
            className={buttonClasses(variant, className)}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button