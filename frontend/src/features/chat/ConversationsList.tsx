import { useEffect, useRef, useState } from "react"
import api from "../auth/axiosInstance"
import type { ConversationData, ConversationsListProps } from "./chat.types"
import { useWebSocket } from "../../pages/WebSocketContext"
import { formatMessageDate } from "./Message"

export function ConversationsList({
    onSelectFriend,
}: ConversationsListProps) {
    const { lastMessage, connectionStatus } = useWebSocket()
    const isSocketAuthenticated = connectionStatus === "connected"

    const [conversations, setConversations] = useState<ConversationData[]>([])
    const [getError, setGetError] = useState(false)
    const readReceipts = useRef(new Map<string, string>())

    const newMessageId =
        lastMessage?.type === "message"
            ? lastMessage.messageId
            : null

    useEffect(() => {
        if (lastMessage?.type !== "readMessage")
            return

        const key = `${lastMessage.conversationId}:${lastMessage.messageId}`
        readReceipts.current.set(key, lastMessage.readAt)

        setConversations(current =>
            current.map(conversation =>
                conversation.conversationId === lastMessage.conversationId &&
                conversation.lastMessage?.id === lastMessage.messageId
                    ? {
                            ...conversation,
                            lastMessage: {
                                ...conversation.lastMessage,
                                readAt: lastMessage.readAt
                            }
                        }
                    : conversation
            )
        )
    }, [lastMessage])

    useEffect(() => {
        let cancelled = false

        async function loadConversations() {
            try {
                const response = await api.get<ConversationData[]>("/api/conversations")

                if (!cancelled) {
                    const receivedConversations = response.data.map(conversation => {
                        const lastMessage = conversation.lastMessage
                        if (!lastMessage)
                            return conversation

                        const key = `${conversation.conversationId}:${lastMessage.id}`
                        const readAt = readReceipts.current.get(key)
                        if (readAt === undefined || readAt === lastMessage.readAt)
                            return conversation

                        return { ...conversation, lastMessage: { ...lastMessage, readAt } }
                    })

                    setConversations(current =>
                        receivedConversations.map(conversation => {
                            const existing = current.find(
                                item => item.conversationId === conversation.conversationId
                            )

                            if (
                                existing?.lastMessage?.id === conversation.lastMessage?.id &&
                                existing?.lastMessage?.readAt
                            ) {
                                return {
                                    ...conversation,
                                    lastMessage: {
                                        ...conversation.lastMessage!,
                                        readAt: existing.lastMessage.readAt
                                    }
                                }
                            }

                            return conversation
                        })
                    )

                    setGetError(false)
                }
            } catch (error) {
                if (!cancelled) {
                    setGetError(true)
                }
            }
        }

        loadConversations()

        return () => {
            cancelled = true
        }
    }, [newMessageId, isSocketAuthenticated])

    function handleSelectConversation(conversation: ConversationData) {
        setConversations(current =>
            current.map(item =>
                item.conversationId === conversation.conversationId &&
                item.lastMessage &&
                item.lastMessage.senderId === conversation.user.id
                    ? {
                            ...item,
                            lastMessage: {
                                ...item.lastMessage,
                                readAt: item.lastMessage.readAt ?? new Date().toISOString()
                            }
                        }
                    : item
            )
        )

        onSelectFriend(conversation.user)
    }

    return (
        <section className="flex h-full flex-col gap-4">
            <h2 className="text-center text-lg font-semibold text-app-text">
                Conversations
            </h2>

            <div className="flex flex-1 flex-col gap-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {getError ? (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="text-center text-sm text-app-text-secondary">
                            Failed to load conversations.
                        </p>
                    </div>
                ) : conversations.length === 0 ? (
                    <div className="flex flex-1 items-center justify-center">
                        <p className="text-center text-sm text-app-text-secondary">
                            You have no conversations.
                        </p>
                    </div>
                ) : (
                    conversations.map(conversation => {
                        const avatar = conversation.user.avatarUrl
                            ? new URL(
                                    conversation.user.avatarUrl,
                                    api.defaults.baseURL
                            ).href
                            : "/default-avatar.png"

                        const last = conversation.lastMessage

                        const isUnread =
                            last &&
                            !last.readAt &&
                            last.senderId === conversation.user.id

                        return (
                            <>
                            <button
                                key={conversation.conversationId}
                                type="button"
                                onClick={() => handleSelectConversation(conversation)}
                                className="flex items-center gap-3 rounded-lg p-2 text-left hover:bg-app-surface-hover"
                            >
                                <img
                                    src={avatar}
                                    alt={conversation.user.username}
                                    className="h-12 w-12 shrink-0 rounded-full border border-app-border object-cover"
                                />

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-app-text">
                                        {conversation.user.displayName ??
                                            conversation.user.username}
                                    </p>

                                    <p className={`truncate text-xs ${
                                        isUnread
                                            ? "font-bold text-app-text"
                                            : "text-app-text-muted"
                                    }`}>
                                        {last?.senderId !== conversation.user.id && last
                                            ? "You: "
                                            : ""}
                                        {last?.content ?? "No messages yet"}
                                    </p>
                                </div>

                                {last?.createdAt && (
                                    <span className="shrink-0 text-xs text-app-text-muted">
                                        {formatMessageDate(last.createdAt)}
                                    </span>
                                )}                            
                            </button>
                            <div className="border-t border-app-border" />
</>
                        )
                    })
                )}
            </div>
        </section>
    )
}
