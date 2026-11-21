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

// Render the selected conversation and its message composer.
export default function ChatWindow({
    friend,
    onSendMessage,
    lastMessage,
    onBack,
    onlineFriends
}: ChatWindowProps) {
    // Keep the cursor for the next page of older messages.
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    // Track whether older messages are available.
    const [hasMore, setHasMore] = useState(false)
    // Track whether an older page is loading.
    const [loadingOlder, setLoadingOlder] = useState(false)
    const { wsRef, connectionStatus, lastMessage: wsMessage } = useWebSocket()
    const { user } = useAuth()
    // Track whether the selected friend can receive messages.
    const [canMessage, setCanMessage] = useState(false)
    // Store the messages displayed in this conversation.
    const [msgs, setMsgs] = useState<MessageData[]>([])
    // Store the draft in the message input.
    const [msg, setMsg] = useState("")
    const chatBodyRef = useRef<HTMLDivElement>(null)
    const previousScrollHeight = useRef<number | null>(null)
    const sentReadReceipts = useRef(new Set<string>())
    // Track whether the message history failed to load.
    const [loadError, setleadError] = useState<true | false>(false)
    // Track whether an older page failed to load.
    const [loadMoreError, setloadMoreError] = useState<true | false>(false)
    // Store the latest message send error.
    const [sendError, setSendError] = useState("")
    const friendshipUpdate = wsMessage?.type === "friendship_updated" ? wsMessage.userId : null
    // Show send errors reported by the server.
    useEffect(() => {
        if (lastMessage?.type === "send_error") {
            setSendError(lastMessage.message)
        }
    }, [lastMessage])
    // Clear the send error when the selected friend changes.
    useEffect(() => {
        setSendError("")
    }, [friend?.id])
    // Check messaging permission after friend, connection, or friendship changes.
    useEffect(() => {
        if (!friend) {
            setCanMessage(false)
            return
        }

        let cancelled = false
        setCanMessage(false)

        // Fetch and apply the current messaging permission.
        async function checkPermission() {
            try {
                const response = await api.get<{ canMessage: boolean }>(
                    `/api/friends/${friend!.id}/can-message`
                )
                if (!cancelled)
                    setCanMessage(response.data.canMessage)
            } catch (error) {
                console.error("Permission check failed:", error)
                if (!cancelled)
                    setCanMessage(false)
            }
        }

        checkPermission()
        return () => {
            cancelled = true
        }
    }, [friend?.id, connectionStatus, friendshipUpdate])

    // Reset messages and pagination when the selected friend changes.
    useEffect(() => {
        setMsgs([])
        setNextCursor(null)
        setHasMore(false)
    }, [friend?.id])

    // Load message history when the selected friend has a live connection.
    useEffect(() => {
        if (!friend || connectionStatus !== "connected")
            return

        let cancelled = false
        const friendId = friend.id

        // Fetch history and merge it with any messages already received.
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
                        messages.set(message.id, message)
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
                    console.error("Failed to load messages:", error)
                    setleadError(true)
                }
            }
        }

        getMessageHistory()

        // Ignore the history response after this effect is cleaned up.
        return () => {
            cancelled = true
        }
    }, [friend?.id, connectionStatus])

    // Preserve scroll position when older messages load. Otherwise scroll to the bottom.
    useLayoutEffect(() => {
        const chatBody = chatBodyRef.current
        if (!chatBody)
            return

        if (previousScrollHeight.current !== null) {
            const difference = chatBody.scrollHeight - previousScrollHeight.current
            chatBody.scrollTop += difference
            previousScrollHeight.current = null
        } else {
            chatBody.scrollTop = chatBody.scrollHeight
        }
    }, [msgs])

    // Apply incoming read receipts to the matching message.
    useEffect(() => {
        if (lastMessage?.type !== "readMessage")
            return

        setMsgs(current =>
            current.map(message =>
                message.id === lastMessage.messageId &&
                message.conversationId === lastMessage.conversationId
                    ? { ...message, readAt: lastMessage.readAt }
                    : message
            )
        )
    }, [lastMessage])

    // Add live messages for this conversation without duplicating them.
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

            return [...current, {
                id: lastMessage.messageId,
                senderId: lastMessage.from,
                content: lastMessage.content,
                conversationId: lastMessage.conversationId,
                createdAt: lastMessage.createdAt,
                readAt: null
            }].sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            )
        })
    }, [lastMessage, friend?.id, user?.id])

    // A new connection may need to resend receipts that the server never received.
    useEffect(() => {
        sentReadReceipts.current.clear()
    }, [connectionStatus])

    // mark messages in the open conversation as read.
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

    // Load the next page of older messages and preserve the scroll position.
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
                    messages.set(message.id, message)
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
            console.error("Failed to load older messages:", error)
            setloadMoreError(true)
        } finally {
            setLoadingOlder(false)
        }
    }

    // Send a trimmed draft when messaging is available.
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

            {/* Messages */}
            <div
                ref={chatBodyRef}
                className={`flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-4 sm:px-5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden1 ${loadError ? "hidden" : ""}`}
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
            {loadError &&
                <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
                    <p className="text-sm text-app-text-secondary">
                        Failed to load messages.
                    </p>
                </div>
            }
            {sendError && (
                <p className="text-center text-sm text-red-500">
                    {sendError}
                </p>
            )}
            {/* Message input */}
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
