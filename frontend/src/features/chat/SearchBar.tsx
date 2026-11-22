import { Search } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { Link } from "react-router-dom"
import api from "../auth/axiosInstance"
import type { FriendData } from "./chat.types"

type SearchResponse = {
    users: FriendData[]
    nextCursor: string | null
    hasMore: boolean
}

interface SearchBarProps {
    hideOnMobile: boolean
}

export default function SearchBar({ hideOnMobile }: SearchBarProps) {
    const [name, setName] = useState("")
    const [listUser, setListName] = useState<FriendData[]>([])
    const [nextCursor, setNextCursor] = useState<string | null>(null)
    const [hasMore, setHasMore] = useState(false)
    const [loading, setLoading] = useState(false)
    const [loadingMore, setLoadingMore] = useState(false)

    const searchVersion = useRef(0)
    const loadingMoreRef = useRef(false)

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
                    "/api/users/name",
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
                "/api/users/name",
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

    return (
        <div
            className={`relative z-20 shrink-0 px-4 pt-2 md:px-0 md:pb-5 ${hideOnMobile ? "hidden md:block" : "block"}`}
        >
            <div className="flex w-full items-center gap-1 rounded-3xl border border-app-border bg-app-surface-raised px-4 py-3 focus-within:border-app-primary">
                <Search className="h-5 w-5 shrink-0 text-zinc-500" />
                <input
                    type="text"
                    placeholder="Search for users..."
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full min-w-0 border-none bg-transparent text-base text-white outline-none placeholder-zinc-500 focus:outline-none! focus:ring-0 md:text-sm"
                />
            </div>

            {name.trim() && (
                <div
                    className="
                        absolute inset-x-4 top-full md:inset-x-0
                        z-30 mt-1
                        max-h-[min(16rem,40dvh)] md:max-h-64
                        overflow-y-auto overscroll-contain
                        rounded-2xl
                        border border-app-border
                        bg-app-surface
                        p-1.5
                        shadow-xl
                        [scrollbar-width:none]
                        [&::-webkit-scrollbar]:hidden
                    "
                >
                    {loading ? (
                        <p role="status" className="px-4 py-5 text-center text-sm text-app-text-secondary">
                            Searching...
                        </p>
                    ) : listUser.length === 0 ? (
                        <p role="status" className="px-4 py-5 text-center text-sm text-app-text-secondary">
                            No users found.
                        </p>
                    ) : (
                        <div className="flex flex-col gap-0.5">
                            {listUser.map(user => (
                                <Link
                                    key={user.id}
                                    to={`/profile/${encodeURIComponent(user.username)}`}
                                    className="
                                        flex min-w-0 items-center gap-3
                                        rounded-xl px-3 py-2.5
                                        transition-colors
                                        hover:bg-app-surface-hover
                                        focus-visible:bg-app-surface-hover
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
                                        alt=""
                                        className="h-10 w-10 shrink-0 rounded-full border border-app-border object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-medium text-app-text">
                                            {user.displayName || user.username}
                                        </p>

                                        <p className="truncate text-xs text-app-text-secondary">
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
                                        mt-1 w-full rounded-xl
                                        border border-app-border
                                        bg-app-surface-raised
                                        px-3 py-2.5 text-sm font-medium text-app-text
                                        transition-colors
                                        hover:bg-app-surface-hover
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
    )
}
