import ChatWindow from "../features/chat/ChatWindow"
import { FriendsList } from "../features/chat/FriendsList"
import { useEffect, useState } from "react"
import type { FriendData, ClientMessage } from "../features/chat/chat.types"
import { useWebSocket } from "./WebSocketContext"
import api from "../features/auth/axiosInstance"
import { ConversationsList } from "../features/chat/ConversationsList"
import { useSearchParams } from "react-router-dom"
import SearchBar from "../features/chat/SearchBar"

function Social() {
    const { wsRef, lastMessage: wsMessage, onlineUserIds, connectionStatus, onlineFriendsRefreshFailed } = useWebSocket()

    const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null)
    const [friends, setFriends] = useState<FriendData[]>([])

    const [searchParams] = useSearchParams()
    const targetUserId = searchParams.get("userId")

    // Open conversation from Home page
    useEffect(() => {
        if (!targetUserId)
            return

        const targetFriend = friends.find(
            friend => friend.id === targetUserId
        )

        if (targetFriend)
            setSelectedFriend(targetFriend)
    }, [targetUserId, friends])

    // Refresh friends when friendship changes
    useEffect(() => {
        if (wsMessage?.type !== "friendship_updated")
            return

        async function refreshFriends() {
            try {
                const response = await api.get<FriendData[]>("/api/friends")
                setFriends(response.data)
            } catch (error) {}
        }

        refreshFriends()
    }, [wsMessage])

    // Load friends
    useEffect(() => {
        async function getFriends() {
            try {
                const response = await api.get<FriendData[]>("/api/friends")
                setFriends(response.data)
            } catch (error) {}
        }

        getFriends()
    }, [])

    function sendMessage(recipientId: string, content: string): boolean {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
            return false

        const message: ClientMessage = {
            type: "message",
            to: recipientId,
            content
        }

        try {
            wsRef.current.send(JSON.stringify(message))
            return true
        } catch {
            return false
        }
    }

    function handleBack() {
        setSelectedFriend(null)
    }

    const onlineFriends = friends.filter(friend =>
        onlineUserIds.includes(friend.id)
    )

    return (
        <div className="flex h-[calc(100dvh-3rem)] min-h-0 w-full flex-col bg-app-surface md:h-[calc(100dvh-4rem)] md:bg-transparent">
            <SearchBar hideOnMobile={selectedFriend !== null} />
            <div
                className="
                    flex min-h-0 min-w-0 flex-1
                    overflow-hidden bg-app-surface
                    overscroll-none
                    md:gap-4 md:bg-transparent
                    "
                    >
                {/* Friends and conversations */}
                <aside
                    className={`
                        ${selectedFriend ? "hidden" : "flex"}
                        min-h-0 w-full flex-col gap-0
                        overflow-hidden bg-app-surface
                        md:flex md:w-[30%] md:min-w-60 md:max-w-96
                        md:shrink-0 md:gap-4 md:overflow-visible
                        md:bg-transparent
                        `}
                >
                    {/* Online friends */}
                    <div
                        className="
                        shrink-0 p-4
                        md:rounded-2xl md:border md:border-app-border
                        md:bg-app-surface
                        "
                        >
                        {connectionStatus === "connected" && onlineFriendsRefreshFailed && (
                            <p className="mb-2 text-center text-sm text-red-500">
                                Couldn’t refresh online friends.
                            </p>
                        )}
                        <FriendsList
                            friends={onlineFriends}
                            onSelectFriend={setSelectedFriend}
                        />
                    </div>

                    {/* Separator visible only on mobile */}
                    <div className="mx-4 border-t border-app-border md:hidden" />

                    {/* Conversations */}
                    <div
                        className="
                        min-h-0 flex-1 overflow-y-auto p-4
                        [scrollbar-width:none]
                        [&::-webkit-scrollbar]:hidden
                        md:rounded-2xl md:border md:border-app-border
                            md:bg-app-surface
                        "
                        >
                        <ConversationsList
                            onSelectFriend={setSelectedFriend}
                            />
                    </div>
                </aside>

                {/* Chat */}
                <section
                    className={`
                        ${selectedFriend ? "flex" : "hidden"}
                        min-h-0 min-w-0 flex-1 flex-col
                        overflow-hidden bg-app-surface
                        md:flex md:rounded-2xl
                        md:border md:border-app-border
                    `}
                >
                    <ChatWindow
                        key={selectedFriend?.id ?? "no-friend"}
                        friend={selectedFriend}
                        onSendMessage={sendMessage}
                        lastMessage={wsMessage}
                        onBack={handleBack}
                        onlineFriends={onlineFriends}
                        />
                </section>
            </div>
        </div>
    )
}

export default Social
