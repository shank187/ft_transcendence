import { useEffect, useRef, type ReactNode } from "react"
import Button from "./Button"

const DIALOG_LAYOUT = {
    modal: "m-auto w-[90vw] max-w-md rounded-lg p-5",
    drawer: "ml-auto flex h-dvh max-h-none w-[480px] max-w-full flex-col p-6",
} as const

interface DialogProps {
    title: string
    isWorking: boolean
    onClose: () => void
    children: ReactNode
    showClose?: boolean
    variant?: "modal" | "drawer"
}

export default function Dialog({
    title, onClose, isWorking, children, showClose, variant = "modal"
}: DialogProps) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    // Open while mounted: the parent shows the dialog by rendering it and hides it by unmounting it.
    // The dialog.open check stops StrictMode's second effect run from calling showModal() twice (it throws).
    useEffect(() => {
        const dialog = dialogRef.current
        if (dialog && !dialog.open) dialog.showModal()
    }, [])

    return (
        <dialog
        ref={dialogRef}
        aria-label={title}
        onClose={e => {
            if (isWorking) {
                e.currentTarget.showModal()
                return
            }
            onClose()
        }}
        onCancel={(e)=>{
            if(isWorking)
                e.preventDefault()
        }}
        className={`${DIALOG_LAYOUT[variant]} bg-app-surface text-app-text backdrop:bg-app-canvas/70`}
        >
            <div className="flex items-start justify-between gap-3">
                <h2 className="text-lg font-semibold">{title}</h2>
                {showClose && (
                    <Button
                        type="button"
                        aria-label="Close"
                        title="Close"
                        disabled={isWorking}
                        onClick={() => dialogRef.current?.close()}
                        variant="secondary"
                        className="min-h-11 min-w-11 border border-app-border"
                    >
                        ✕
                    </Button>
                )}
            </div>
            <div className={variant === "drawer" ? "mt-4 flex min-h-0 flex-1 flex-col" : "mt-3 flex flex-col gap-3"}>
                {children}
            </div>
        </dialog>
    )
}
