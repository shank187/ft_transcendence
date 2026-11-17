import ChatWindow from "../features/chat/ChatWindow"
import FriendsList from "../features/chat/FriendsList"
import { useEffect, useRef, useState } from "react"
import type { FriendData, ClientMessage } from "../features/chat/chat.types"
import { useWebSocket } from "./WebSocketContext"
import api from "../features/auth/axiosInstance"
import { ConversationsList } from "../features/chat/ConversationsList"
import { Link, useSearchParams } from "react-router-dom"
import SearchBar from "../features/Gyms/components/SearchBar"

type SearchResponse = {
    users: FriendData[]
    nextCursor: string | null
    hasMore: boolean
}

function Social() {
    const { wsRef, lastMessage: wsMessage, onlineUserIds } = useWebSocket()

    const [selectedFriend, setSelectedFriend] = useState<FriendData | null>(null)
    const [friends, setFriends] = useState<FriendData[]>([])

    const [searchParams] = useSearchParams()
    const targetUserId = searchParams.get("userId")

    // User search
    const [name, setName] = useState("")
    const [listUser, setListName] = useState<FriendData[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)

    const searchVersion = useRef(0)
    const loadingMoreRef = useRef(false)

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
            } catch (error) {
                console.error("Failed to refresh friends:", error)
            }
        }

        refreshFriends()
    }, [wsMessage])

    // Load friends
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

    // Search users - first 10 results
    useEffect(() => {
        const query = name.trim()
        const version = ++searchVersion.current

        setListName([])
        setNextCursor(null)
        setHasMore(false)
        setLoading(false)
        setLoadingMore(false)
        loadingMoreRef.current = false

        if (!query)
            return

        const timer = setTimeout(async () => {
            setLoading(true)

            try {
                const response = await api.get<SearchResponse>(
                    "/api/gyms/name",
                    {
                        params: { name: query }
                    }
                )

                if (version !== searchVersion.current)
                    return

                setListName(response.data.users)
                setNextCursor(response.data.nextCursor)
                setHasMore(response.data.hasMore)
            } catch (error) {
                if (version === searchVersion.current)
                    console.error("Failed to search users:", error)
            } finally {
                if (version === searchVersion.current)
                    setLoading(false)
            }
        }, 300)

        return () => {
            clearTimeout(timer)
            searchVersion.current++
        }
    }, [name])

    // Load next 10 users
    async function loadMore() {
        if (!hasMore || !nextCursor || loadingMoreRef.current)
            return

        const version = searchVersion.current
        const cursor = nextCursor
        const query = name.trim()

        loadingMoreRef.current = true
        setLoadingMore(true)

        try {
            const response = await api.get<SearchResponse>(
                "/api/gyms/name",
                {
                    params: {
                        name: query,
                        cursor
                    }
                }
            )

            if (version !== searchVersion.current)
                return

            setListName(current => {
                const existingIds = new Set(current.map(user => user.id))

                const newUsers = response.data.users.filter(
                    user => !existingIds.has(user.id)
                )

                return [...current, ...newUsers]
            })

            setNextCursor(response.data.nextCursor)
            setHasMore(response.data.hasMore)
        } catch (error) {
            if (version === searchVersion.current)
                console.error("Failed to load more users:", error)
        } finally {
            if (version === searchVersion.current) {
                loadingMoreRef.current = false
                setLoadingMore(false)
            }
        }
    }

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
        <div className="flex h-[calc(100dvh-5rem)] min-h-0 w-full flex-col md:h-[calc(100dvh-4rem)]">
                <div     className={`
        relative z-20 shrink-0 p-5
        ${selectedFriend ? "hidden md:block" : "block"}
    `}>
                    <SearchBar
                        searchTerm={name}
                        onSearchChange={setName}
                    />

                    {name.trim() && (
                        <div
                            className="
                                absolute left-0 right-0 top-full
                                z-30
                                max-h-64
                                overflow-y-auto
                                rounded-xl
                                border border-zinc-700
                                bg-app-surface
                                p-2
                                shadow-xl
                                [scrollbar-width:none]
                                [&::-webkit-scrollbar]:hidden
                            "
                        >
                            {loading ? (
                                <p className="p-3 text-center text-sm text-app-text-secondary">
                                    Searching...
                                </p>
                            ) : listUser.length === 0 ? (
                                <p className="p-3 text-center text-sm text-app-text-secondary">
                                    No users found.
                                </p>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {listUser.map(user => (
                                        <Link
                                            key={user.id}
                                            to={`/profile/${encodeURIComponent(user.username)}`}
                                            className="
                                                flex items-center gap-3
                                                rounded-lg
                                                border border-zinc-700
                                                bg-zinc-800
                                                p-3
                                                transition-colors
                                                hover:border-zinc-500
                                                hover:bg-zinc-700
                                            "
                                        >
                                            <img
                                                src={
                                                    user.avatarUrl
                                                        ? new URL(
                                                            user.avatarUrl,
                                                            api.defaults.baseURL
                                                        ).href
                                                        : "/default-avatar.png"
                                                }
                                                alt={user.username}
                                                className="h-11 w-11 shrink-0 rounded-full object-cover"
                                            />

                                            <div className="min-w-0">
                                                <p className="truncate font-medium text-app-text">
                                                    {user.displayName || user.username}
                                                </p>

                                                <p className="truncate text-sm text-app-muted">
                                                    @{user.username}
                                                </p>
                                            </div>
                                        </Link>
                                    ))}

                                    {/* Load more users */}
                                    {hasMore && (
                                        <button
                                            type="button"
                                            onClick={loadMore}
                                            disabled={loadingMore}
                                            className="
                                                w-full rounded-lg
                                                border border-zinc-700
                                                bg-zinc-800
                                                p-2 text-sm
                                                text-app-text
                                                transition-colors
                                                hover:bg-zinc-700
                                                disabled:cursor-not-allowed
                                                disabled:opacity-50
                                            "
                                        >
                                            {loadingMore ? "Loading..." : "Load more"}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    )}
                </div>
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
                {/* User search */}


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
        </div>
    )
}

export default Social