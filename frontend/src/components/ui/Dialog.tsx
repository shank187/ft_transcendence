import { useEffect, useRef, type ReactNode } from "react"
import Button from "./Button"

interface DialogProps {
    open: boolean
    title: string
    onClose: () => void
    children: ReactNode
}

export default function Dialog({
    open, title, onClose, children,
}: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useEffect(() => {
        const dialog = dialogRef.current
        if (!dialog) return

        if (open && !dialog.open) {
        dialog.showModal()
        } else if (!open && dialog.open) {
        dialog.close()
        }
    }, [open])

    return (
        <dialog
        ref={dialogRef}
        aria-label={title}
        onClose={onClose}
        className="m-auto w-[90vw] max-w-md rounded-lg p-5
                    bg-app-surface text-app-text
                    backdrop:bg-app-canvas/70"
        >
        <Button aria-label="Close" variant="ghost" onClick={onClose}>X</Button>
        <h2>{title}</h2>
        {children}
        </dialog>
    )
}