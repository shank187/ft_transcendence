
import ChatWindow from "../features/chat/ChatWindow"
import FriendsList from "../features/chat/FriendsList"
import { useEffect, useState } from "react"
import type { FriendData, ClientMessage } from "../features/chat/chat.types"
import { useWebSocket } from "./WebSocketContext"
import api from "../features/auth/axiosInstance"
import { ConversationsList } from "../features/chat/ConversationsList"

function Social() {
    const { wsRef, lastMessage: wsMessage, onlineUserIds } = useWebSocket()

    const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null)
    const [friends, setFriends] = useState<FriendData[]>([])
useEffect(() => {
    if (wsMessage?.type !== "friendship_updated")
        return

    async function refreshFriends() {
        try {
            const response = await api.get<FriendData[]>("/api/friends")
            setFriends(response.data)
        } catch (error) {
            console.error("Failed to refresh friends:", error)
        }
    }

    refreshFriends()
}, [wsMessage])
    function sendMessage(RecipientId: string, content: string): boolean {
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN)
            return false
        
            const message: ClientMessage = {
            type: "message",
            to: RecipientId,
            content: content
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



    useEffect(() => {
        async function getFriends() {
            try {
                const response = await api.get<FriendData[]>("/api/friends")
                setFriends(response.data)
            } catch (error) {
                console.error("Failed to get friends:", error)
            }
        }

        getFriends()
    }, [])

    const onlineFriends = friends.filter(friend =>
        onlineUserIds.includes(friend.id)
    )

    return (
<div
    className="
        flex
        h-[calc(100dvh-5rem)]
        min-h-0
        w-full
        min-w-0
        overflow-hidden
        bg-app-surface
        overscroll-none
        md:h-[calc(100dvh-4rem)]
        md:gap-4
        md:bg-transparent
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
                />
            </section>
        </div>
    )
}

export default Social
