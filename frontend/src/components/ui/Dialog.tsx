import { useEffect, useRef, type ReactNode } from "react"

interface DialogProps {
    open: boolean
    title: string
    isWorking: boolean
    onClose: () => void
    children: ReactNode
}

export default function Dialog({
    open, title, onClose, isWorking, children,
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
        className="m-auto w-[90vw] max-w-md rounded-lg p-5
                    bg-app-surface text-app-text
                    backdrop:bg-app-canvas/70"
                    
        >
            <h2 className="text-lg font-semibold">{title}</h2>
            <div className="mt-3 flex flex-col gap-3">{children}</div>
        </dialog>
    )
}