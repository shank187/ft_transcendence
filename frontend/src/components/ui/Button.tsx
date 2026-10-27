import type {
    ButtonHTMLAttributes,
    ReactNode,
} from 'react'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './button-classes'

interface ButtonProps
    extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode
    variant?: ButtonVariant
    size?: ButtonSize
}

function Button({
    children,
    variant = 'primary',
    size = 'md',
    className = '',
    type = 'button',
    ...props
}: ButtonProps) {
    return (
        <button
            type={type}
            className={buttonClasses(variant, className, size)}
            {...props}
        >
            {children}
        </button>
    )
}

export default Button
