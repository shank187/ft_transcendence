import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import api from "../auth/axiosInstance"

type Friend = {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    lastSeenAt: string | null
}

type ProfileFriendsProps = {
    userId: string
    onClose: () => void
}

export default function ProfileFriends({
    userId,
    onClose
}: ProfileFriendsProps) {
    const [friends, setFriends] = useState<Friend[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        let cancelled = false

        async function fetchFriends() {
            setLoading(true)
            setError(false)

            try {
                const response = await api.get<Friend[]>(
                    `/api/users/${userId}/friends`
                )

                if (!cancelled)
                    setFriends(response.data)
            } catch (error) {
                console.error("Failed to fetch friends:", error)

                if (!cancelled)
                    setError(true)
            } finally {
                if (!cancelled)
                    setLoading(false)
            }
        }

        fetchFriends()

        return () => {
            cancelled = true
        }
    }, [userId])

    return (
        <div className="rounded-xl border border-app-border bg-app-surface p-4">
            <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-app-text">
                    Friends ({friends.length})
                </h2>

                <button
                    type="button"
                    onClick={onClose}
                    className="text-sm text-app-muted hover:text-app-text"
                >
                    ✕
                </button>
            </div>
            {loading ? (
                <p className="text-app-muted">Loading friends...</p>
            ) : error ? (
                <p className="text-red-500">
                    Failed to load friends.
                </p>
            ) : friends.length === 0 ? (
                <p className="text-app-muted">No friends yet.</p>
            ) : (
                <div className="flex flex-col gap-2">
                    {friends.map(friend => (
                        <Link
                            key={friend.id}
                            to={`/profile/${encodeURIComponent(friend.username)}`}
                            onClick={onClose}
                            className="flex items-center gap-3 rounded-lg p-2 hover:bg-app-border"
                        >
                            <img
                                src={
                                    friend.avatarUrl
                                        ? new URL(
                                            friend.avatarUrl,
                                            api.defaults.baseURL
                                        ).href
                                        : "/default-avatar.png"
                                }
                                alt={friend.username}
                                className="h-11 w-11 rounded-full object-cover"
                            />

                            <div>
                                <p className="font-medium text-app-text">
                                    {friend.displayName || friend.username}
                                </p>

                                <p className="text-sm text-app-muted">
                                    @{friend.username}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    )
}