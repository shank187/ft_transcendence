import type { ReactNode } from 'react'

interface ButtonProps {
    children: ReactNode
}

function Button(props: ButtonProps) {
    return (
        <button>
            {props.children}
        </button>
    )
}

export default Button