
import { useEffect, useState, useContext } from "react"
import api from "../auth/axiosInstance"
import type { ConversationData, ConversationsListProps } from "./chat.types"
import { WebSocketContext } from "../../pages/WebSocketContext"

export function ConversationsList({ 
    onSelectFriend,
 }: ConversationsListProps) {
    const { lastMessage } = useContext(WebSocketContext)
    const [conversations, setConversations] = useState<ConversationData[]>([])

    useEffect(() => {
        let cancelled = false

        async function loadConversations() {
            try {
                const response = await api.get<ConversationData[]>("/api/conversations")

                if (!cancelled)
                    setConversations(response.data)
            } catch (error) {
                if (!cancelled)
                    console.error("Failed to load conversations:", error)
            }
        }

        loadConversations()

        return () => {
            cancelled = true
        }
    }, [lastMessage])
    function handleSelectConversation(conversation: ConversationData) {
        setConversations(current =>
            current.map(item => 
                item.conversationId === conversation.conversationId ? 
                    {...item, lastMessage: item.lastMessage ? {...item.lastMessage, readAt: item.lastMessage.readAt ?? new Date().toISOString()}: null} : item
            )
        )

    onSelectFriend(conversation.user)
}
    return (
        <section className="flex h-full min-h-0 flex-col gap-4">
            <h2 className="shrink-0 text-center text-lg font-semibold text-app-text">
                Conversations
            </h2>

            <div className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {conversations.length === 0 ? (
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
                        const unread = Boolean(
                            last && !last.readAt &&
                            last.senderId === conversation.user.id
                        )

                        return (
                            <button
                                key={conversation.conversationId}
                                type="button"
                                onClick={() => handleSelectConversation(conversation)}
                                className="flex w-full items-center gap-3 rounded-lg p-2 text-left hover:bg-app-surface-hover"
                            >
                                <img
                                    src={avatar}
                                    alt={conversation.user.username}
                                    className="h-11 w-11 shrink-0 rounded-full border border-app-border object-cover sm:h-12 sm:w-12"
                                />

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-medium text-app-text">
                                        {conversation.user.displayName ??
                                            conversation.user.username}
                                    </p>

                                    <p className={`truncate text-xs ${
                                        unread
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
                                    <span className={`shrink-0 text-xs ${
                                        unread
                                            ? "font-bold text-app-text"
                                            : "text-app-text-muted"
                                    }`}>
                                        {new Date(last.createdAt).toLocaleTimeString([], {
                                            hour: "2-digit",
                                            minute: "2-digit"
                                        })}
                                    </span>
                                )}
                            </button>
                        )
                    })
                )}
            </div>
        </section>
    )
}
