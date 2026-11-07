import type { MessageProps } from "./chat.types";

export function formatMessageDate(createdAt: string) {
    const date = new Date(createdAt)
    const today = new Date()

    const yesterday = new Date(today)
    yesterday.setDate(today.getDate() - 1)

    const time = date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
    })

    if (date.toDateString() === today.toDateString())
        return time

    if (date.toDateString() === yesterday.toDateString())
        return `Yesterday, ${time}`

    const formattedDate = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        ...(date.getFullYear() !== today.getFullYear() && {
            year: "numeric" as const
        })
    })

    return `${formattedDate}, ${time}`
}

export default function Message({ message, myUserId }: MessageProps) {
    const isMine = message.senderId === myUserId;

    return (
        <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
            <div
                className={`max-w-[75%] rounded-xl px-4 py-2 ${
                    isMine
                        ? "bg-app-primary-muted text-app-canvas"
                        : "bg-app-surface-raised text-app-text"
                }`}
            >
                <p className="break-words text-sm">
                    {message.content}
                </p>

                <div className="mt-1 flex justify-end gap-2 text-xs opacity-70">
                    <span>
                        {formatMessageDate(message.createdAt)}
                    </span>
                </div>
            </div>
        </div>
    );
}