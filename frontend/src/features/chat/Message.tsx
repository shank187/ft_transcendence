import type { MessageProps } from "./chat.types";

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
                        {new Date(message.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit"
                        })}
                    </span>
                </div>
            </div>
        </div>
    );
}