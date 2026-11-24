import { useEffect, useLayoutEffect, useRef, useState } from "react"
import type {
    MessageData,
    ChatWindowProps,
    MessageHistoryResponse
} from "./chat.types"
import Message from "./Message"
import { Link } from "react-router-dom"
import api from "../auth/axiosInstance"
import { useAuth } from "../auth/AuthContext"
import { useWebSocket } from "../../pages/WebSocketContext"

export default function ChatWindow({
    friend,
    onSendMessage,
    lastMessage,
    onBack,
    onlineFriends
}: ChatWindowProps) {
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [loadingOlder, setLoadingOlder] = useState(false)
    const { wsRef, connectionStatus, lastMessage: wsMessage } = useWebSocket()
    const { user } = useAuth()
    const [canMessage, setCanMessage] = useState(false)
    const [permissionError, setPermissionError] = useState(false)
    const [permissionRetry, setPermissionRetry] = useState(0)
    const [msgs, setMsgs] = useState<MessageData[]>([])
    const [msg, setMsg] = useState("")
    const chatBodyRef = useRef<HTMLDivElement>(null)
    const previousScrollHeight = useRef<number | null>(null)
    const sentReadReceipts = useRef(new Set<string>())
    const [loadError, setleadError] = useState<true | false>(false)
    const [loadMoreError, setloadMoreError] = useState<true | false>(false)
    const [sendError, setSendError] = useState("")
    const friendshipUpdate = wsMessage?.type === "friendship_updated" ? wsMessage.userId : null
    const [historyRetry, setHistoryRetry] = useState(0)
    const previousMessageIds = useRef<MessageData["id"][]>([])
    const readReceipts = useRef(new Map<string, string>())

    function applyReadReceipt(message: MessageData): MessageData {
        const key = `${message.conversationId}:${message.id}`
        const readAt = readReceipts.current.get(key)

        if (readAt === undefined || readAt === message.readAt)
            return message

        return { ...message, readAt }
    }
    useEffect(() => {
        if (lastMessage?.type === "send_error") {
            setSendError(lastMessage.message)
        }
    }, [lastMessage])
    useEffect(() => {
        setSendError("")
    }, [friend?.id])
    useEffect(() => {
        const friendId = friend?.id
        setCanMessage(false)
        setPermissionError(false)

        if (!friendId)
            return

        let cancelled = false

        async function checkPermission() {
            try {
                const response = await api.get<{ canMessage: boolean }>(
                    `/api/friends/${friendId}/can-message`
                )
                if (!cancelled)
                    setCanMessage(response.data.canMessage)
            } catch {
                if (!cancelled)
                    setPermissionError(true)
            }
        }

        checkPermission()
        return () => {
            cancelled = true
        }
    }, [friend?.id, connectionStatus, friendshipUpdate, permissionRetry])

    useEffect(() => {
        setMsgs([])
        setNextCursor(null)
        setHasMore(false)
    }, [friend?.id])

    useEffect(() => {
        if (!friend || connectionStatus !== "connected")
            return

        let cancelled = false
        const friendId = friend.id

        async function getMessageHistory() {
            try {
                const response = await api.get<MessageHistoryResponse>(
                    `/api/conversations/${friendId}/messages`
                )
                if (cancelled)
                    return

                setMsgs(current => {
                    const messages = new Map<string, MessageData>()

                    response.data.messages.forEach(message => {
                        messages.set(message.id, applyReadReceipt(message))
                    })

                    current.forEach(message => {
                        const existing = messages.get(message.id)

                        messages.set(message.id, {
                            ...message,
                            readAt: message.readAt || existing?.readAt || null
                        })
                    })

                    return Array.from(messages.values()).sort(
                        (a, b) =>
                            new Date(a.createdAt).getTime() -
                            new Date(b.createdAt).getTime()
                    )
                })

                setNextCursor(response.data.nextCursor)
                setHasMore(response.data.hasMore)
                setleadError(false)
            } catch (error) {
                if (!cancelled) {
                    setleadError(true)
                }
            }
        }

        getMessageHistory()

        return () => {
            cancelled = true
        }
    }, [friend?.id, connectionStatus, historyRetry])

    useLayoutEffect(() => {
        const chatBody = chatBodyRef.current
        if (!chatBody)
            return
        const currentIds = msgs.map(message => message.id)
        const previousIds = previousMessageIds.current
        previousMessageIds.current = currentIds

        const sameMessages = currentIds.length === previousIds.length &&
        currentIds.every((id, index) => id === previousIds[index])
        if (sameMessages)
            return
        if (previousScrollHeight.current !== null) {
            const difference = chatBody.scrollHeight - previousScrollHeight.current
            chatBody.scrollTop += difference
            previousScrollHeight.current = null
        } else {
            chatBody.scrollTop = chatBody.scrollHeight
        }
    }, [msgs])

    useEffect(() => {
        if (lastMessage?.type !== "readMessage")
            return
        const key = `${lastMessage.conversationId}:${lastMessage.messageId}`
        readReceipts.current.set(key, lastMessage.readAt)
        setMsgs(current => {
            const index = current.findIndex(message =>
                message.id === lastMessage.messageId &&
                message.conversationId === lastMessage.conversationId
            )

            if (index === -1 || current[index].readAt === lastMessage.readAt)
                return current

            const updated = [...current]
            updated[index] = { ...current[index], readAt: lastMessage.readAt }
            return updated
        })
    }, [lastMessage])

    useEffect(() => {
        if (lastMessage?.type !== "message" || !friend || !user)
            return

        if (
            !(
                (lastMessage.from === user.id && lastMessage.to === friend.id) ||
                (lastMessage.from === friend.id && lastMessage.to === user.id)
            )
        )
            return

        setMsgs(current => {
            if (current.some(message => message.id === lastMessage.messageId))
                return current

            return [...current,applyReadReceipt( {
                id: lastMessage.messageId,
                senderId: lastMessage.from,
                content: lastMessage.content,
                conversationId: lastMessage.conversationId,
                createdAt: lastMessage.createdAt,
                readAt: null
            })].sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            )
        })
    }, [lastMessage, friend?.id, user?.id])

    useEffect(() => {
        sentReadReceipts.current.clear()
    }, [connectionStatus])

    useEffect(() => {
        if (!friend || !user || connectionStatus !== "connected")
            return

        const ws = wsRef.current
        if (!ws || ws.readyState !== WebSocket.OPEN)
            return

        msgs.forEach(message => {
            if (
                message.senderId === friend.id &&
                !message.readAt &&
                !sentReadReceipts.current.has(message.id)
            ) {
                ws.send(JSON.stringify({
                    type: "readMessage",
                    target: friend.id,
                    messageId: message.id
                }))
                sentReadReceipts.current.add(message.id)
            }
        })
    }, [msgs, friend?.id, user?.id, connectionStatus, wsRef])

    async function loadOlderMessages() {
        if (!friend || !nextCursor || !hasMore || loadingOlder)
            return

        setLoadingOlder(true)
        try {
            const response = await api.get<MessageHistoryResponse>(
                `/api/conversations/${friend.id}/messages`,
                { params: { cursor: nextCursor } }
            )

            if (chatBodyRef.current)
                previousScrollHeight.current = chatBodyRef.current.scrollHeight

            setMsgs(current => {
                const messages = new Map<string, MessageData>()

                response.data.messages.forEach(message => {
                    messages.set(message.id, applyReadReceipt(message))
                })

                current.forEach(message => {
                    const existing = messages.get(message.id)
                    messages.set(message.id, {
                        ...message,
                        readAt: message.readAt || existing?.readAt || null
                    })
                })

                return Array.from(messages.values()).sort(
                    (a, b) =>
                        new Date(a.createdAt).getTime() -
                        new Date(b.createdAt).getTime()
                )
            })

            setNextCursor(response.data.nextCursor)
            setHasMore(response.data.hasMore)
            setloadMoreError(false)
        } catch (error) {
            setloadMoreError(true)
        } finally {
            setLoadingOlder(false)
        }
    }

    function handleSubmit(event: React.SubmitEvent<HTMLFormElement>) {
        event.preventDefault()
        const content = msg.trim()

        if (!friend || !canMessage || !content || connectionStatus !== "connected")
            return
        setSendError("")
        const sent = onSendMessage(friend.id, content)
        if (sent)
            setMsg("")
    }

    if (!user)
        return <p className="p-6 text-app-text">You need to be logged in.</p>

    if (!friend)
        return (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                <img src="/chatWindo-icon.png" alt="" className="mb-2 size-20 object-contain" />
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
            <header className="flex shrink-0 items-center gap-3 border-b border-app-border px-3 py-3 sm:px-5 sm:py-4">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="Back to conversations"
                    className="shrink-0 rounded-lg px-2 py-1 text-xl text-app-text hover:bg-app-surface-hover md:hidden"
                >
                    ←
                </button>

                <Link
                    to={`/profile/${encodeURIComponent(friend.username)}`}
                    className="flex min-w-0 items-center gap-3"
                >
                    <div className="relative shrink-0">
                        <img
                            src={avatar}
                            alt={friend.username}
                            className="h-10 w-10 rounded-full border border-app-border object-cover sm:h-12 sm:w-12"
                        />
                        {onlineFriends.some(onlineUser => onlineUser.id === friend.id) && (
                            <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-app-surface bg-app-primary" />
                        )}
                    </div>
                    <h2 className="min-w-0 truncate font-semibold text-app-text">
                        {friend.displayName ?? friend.username}
                    </h2>
                </Link>
            </header>

            <div
                ref={chatBodyRef}
               className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-4 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
                {loadMoreError &&
                    <p className="text-center text-sm text-app-text-secondary">
                    Failed to load old messages.
                    </p>
                }
                {hasMore && (

                    <button
                        type="button"
                        onClick={loadOlderMessages}
                        disabled={loadingOlder}
                        className={`mx-auto shrink-0 rounded-lg border border-app-border px-4 py-2 text-sm text-app-text hover:bg-app-surface-hover disabled:opacity-50`}
                    >
                        {loadingOlder ? "Loading..." : "Load older messages"}
                    </button>
                )}
                {msgs.map(message => (
                    <Message
                        key={message.id}
                        message={message}
                        myUserId={user.id}
                    />
                ))}
            </div>
            {loadError && (
                <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-2 px-3 py-2 sm:px-5">
                    <p className="text-center text-sm text-app-text-secondary">
                        Couldn’t load message history.
                    </p>
                    <button
                        type="button"
                        disabled={connectionStatus !== "connected"}
                        onClick={() => {
                            setleadError(false)
                            setHistoryRetry(current => current + 1)
                        }}
                        className="rounded-lg border border-app-border px-3 py-1 text-sm disabled:opacity-50"
                    >
                        Retry
                    </button>
                </div>
            )}
            {sendError && (
                <p className="text-center text-sm text-red-500">
                    {sendError}
                </p>
            )}
            {permissionError && (
                <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-3 gap-y-2 px-3 py-2 sm:px-5">
                    <p role="status" className="text-center text-sm text-red-500">
                        Couldn’t check if you can send messages.
                    </p>
                    <button
                        type="button"
                        onClick={() => setPermissionRetry(current => current + 1)}
                        className="rounded-lg border border-app-border px-3 py-1 text-sm"
                    >
                        Retry
                    </button>
                </div>
            )}
            <form
                onSubmit={handleSubmit}
                className="flex shrink-0 items-center gap-2 border-t border-app-border p-3 sm:gap-3 sm:p-4"
            >
                <input
                    disabled={!canMessage}
                    type="text"
                    placeholder="Type a message..."
                    aria-label="Message"
                    value={msg}
                    maxLength={500}
                    onChange={event => setMsg(event.target.value)}
                    className="disabled:opacity-50 min-w-0 flex-1 rounded-lg border border-app-border bg-app-surface-raised px-3 py-3 text-base text-app-text outline-none focus:border-app-primary sm:px-4 sm:text-sm"
                />
                <span className="hidden shrink-0 text-xs text-app-text-secondary sm:block">
                    {msg.length}/500
                </span>
                <button
                    type="submit"
                    disabled={!canMessage || !msg.trim() || connectionStatus !== "connected"}
                    className="shrink-0 rounded-lg bg-app-primary px-3 py-3 text-sm font-medium text-white hover:opacity-90 disabled:opacity-50 sm:px-5"
                >
                    Send
                </button>
            </form>
        </section>
    )
}
