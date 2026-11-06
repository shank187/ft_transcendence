import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type { MessageData, ChatWindowProps } from "./chat.types"
import Message from "./Message"
import api from "../auth/axiosInstance"
import { useAuth } from "../auth/AuthContext"
import { useWebSocket } from "../../pages/WebSocketContext"

export default function ChatWindow({
    friend,
    onSendMessage,
    lastMessage,
    onBack
}: ChatWindowProps) {
    const { connectionStatus } = useWebSocket()
    const { user } = useAuth()

    const [msgs, setMsgs] = useState<MessageData[]>([])
    const [msg, setMsg] = useState("")
    const chatBodyRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!friend) {
            setMsgs([])
            return
        }

        if (connectionStatus !== "connected")
            return

        let cancelled = false

        async function getMessageHistory() {
            try {
                const response = await api.get<MessageData[]>(
                    `/api/conversations/${friend!.id}/messages`
                )

                if (cancelled) return

                setMsgs(current => {
                    const messages = new Map<string, MessageData>()

                    response.data.forEach(message => {
                        messages.set(message.id, message)
                    })

                    current.forEach(message => {
                        messages.set(message.id, message)
                    })

                    return Array.from(messages.values()).sort(
                        (a, b) =>
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime()
                    )
                })
            } catch (error) {
                if (!cancelled)
                    console.error("Failed to load messages:", error)
            }
        }

        getMessageHistory()

        return () => {
            cancelled = true
        }
    }, [friend?.id, connectionStatus])

    useLayoutEffect(() => {
        if (chatBodyRef.current)
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
    }, [msgs])

    useEffect(() => {
        if (!lastMessage || lastMessage.type !== "message" || !friend || !user)
            return

        const isCurrentConversation =
            (lastMessage.from === user.id && lastMessage.to === friend.id) ||
            (lastMessage.from === friend.id && lastMessage.to === user.id)

        if (!isCurrentConversation)
            return

        const incomingMessage: MessageData = {
            id: lastMessage.messageId,
            senderId: lastMessage.from,
            content: lastMessage.content,
            conversationId: lastMessage.conversationId,
            createdAt: lastMessage.createdAt,
        }

        setMsgs(current => {
            if (current.some(message => message.id === incomingMessage.id))
                return current

            return [...current, incomingMessage].sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            )
        })
    }, [lastMessage, friend?.id, user?.id])

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()

        if (!friend || !msg.trim())
            return

        const sent = onSendMessage(friend.id, msg.trim())

        if (sent)
            setMsg("")
    }

    if (!user)
        return <p className="p-6 text-app-text">You need to be logged in.</p>

    if (!friend)
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                <h3 className="text-lg font-semibold text-app-text">
                    No conversation selected
                </h3>
                <p className="text-sm text-app-text-secondary">
                    Select a conversation to start chatting.
                </p>
            </div>
        )

    const avatar = friend.avatarUrl
        ? new URL(friend.avatarUrl, api.defaults.baseURL).href
        : "/default-avatar.png"

    return (
        <section className="flex h-full min-h-0 w-full flex-col overflow-hidden bg-app-surface">

            {/* Header */}
            <header className="flex shrink-0 items-center gap-3 border-b border-app-border px-3 py-3 sm:px-5 sm:py-4">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Back to conversations"
                    className="shrink-0 rounded-lg px-2 py-1 text-xl text-app-text hover:bg-app-surface-hover md:hidden"
                >
                    ←
                </button>

                <img
                    src={avatar}
                    alt={friend.username}
                    className="h-10 w-10 shrink-0 rounded-full border border-app-border object-cover sm:h-12 sm:w-12"
                />

                <h2 className="min-w-0 truncate font-semibold text-app-text">
                    {friend.displayName ?? friend.username}
                </h2>
            </header>

            {/* Messages */}
            <div
                ref={chatBodyRef}
                className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-4 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {msgs.map(message => (
                    <Message
                        key={message.id}
                        message={message}
                        myUserId={user.id}
                    />
                ))}
            </div>

            {/* Message input */}
            <form
                onSubmit={handleSubmit}
                className="flex shrink-0 items-center gap-2 border-t border-app-border p-3 sm:gap-3 sm:p-4"
            >
                <input
                    type="text"
                    placeholder={
                        connectionStatus === "connected"
                            ? "Type a message..."
                            : "Waiting for connection..."
                    }
                    aria-label="Message"
                    value={msg}
                    maxLength={500}
                    onChange={event => setMsg(event.target.value)}
                    className="min-w-0 flex-1 rounded-lg border border-app-border bg-app-surface-raised px-3 py-3 text-base text-app-text outline-none focus:border-app-primary sm:px-4 sm:text-sm"
                />

                <span className="hidden shrink-0 text-xs text-app-text-secondary sm:block">
                    {msg.length}/500
                </span>

                <button
                    type="submit"
                    disabled={!msg.trim() || connectionStatus !== "connected"}
                    className="shrink-0 rounded-lg bg-app-primary px-3 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 sm:px-5"
                >
                    Send
                </button>
            </form>
        </section>
    )
}