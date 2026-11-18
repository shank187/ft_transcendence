
import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { useAuth } from "../features/auth/AuthContext"
import api from "../features/auth/axiosInstance"
import type { PublicProfile } from "../features/profile/profile.types"
import ProfileActions from "../features/profile/ProfileActions"
import { useWebSocket } from "./WebSocketContext"
import ProfileFriends from "../features/profile/ProfileFriends"
import PendingRequests from "../features/profile/PendingRequests"

export default function Profile() {
    const { username } = useParams<{ username: string }>()
    const { user } = useAuth()
    const { lastMessage } = useWebSocket()

    const [profile, setProfile] = useState<PublicProfile | null>(null)
    const [loading, setLoading] = useState(true)
    const [showFriends, setShowFriends] = useState(false)
    const [showRequests, setShowRequests] = useState(false)

    async function refreshProfile() {
        const targetUsername = username ?? user?.username

        if (!targetUsername)
            return

        try {
            const response = await api.get<PublicProfile>(
                `/api/users/${encodeURIComponent(targetUsername)}/profile`
            )

            setProfile(response.data)
        } catch (error) {
            console.error("Failed to refresh profile:", error)
        }
    }

    useEffect(() => {
        const targetUsername = username ?? user?.username

        if (!targetUsername) {
            setLoading(false)
            return
        }

        let cancelled = false

        async function fetchProfile() {
            setLoading(true)
            setProfile(null)

            try {
                const response = await api.get<PublicProfile>(
                    `/api/users/${encodeURIComponent(targetUsername!)}/profile`
                )

                if (!cancelled)
                    setProfile(response.data)
            } catch (error) {
                if (!cancelled)
                    console.error("Failed to fetch profile:", error)
            } finally {
                if (!cancelled)
                    setLoading(false)
            }
        }

        fetchProfile()

        return () => {
            cancelled = true
        }
    }, [username, user?.username])

    useEffect(() => {
        if (lastMessage?.type !== "friendship_updated")
            return

        if (lastMessage.userId !== profile?.id)
            return

        refreshProfile()
    }, [lastMessage])

    if (loading)
        return (
            <p className="p-6 text-center text-app-muted">
                Loading profile...
            </p>
        )

    if (!profile)
        return (
            <p className="p-6 text-center text-app-muted">
                Profile not found
            </p>
        )

    return (
        <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:p-4 md:p-6">
            {/* Profile card */}
            <div className="rounded-2xl border border-app-border bg-app-surface px-5 py-8 sm:p-6">
                <div className="flex flex-col gap-7 sm:gap-6">

                    {/* Avatar and profile information */}
                    <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start sm:gap-6">
                        {/* Avatar */}
                        <div className="shrink-0">
                            <img
                                src={
                                    profile.avatarUrl
                                        ? new URL(
                                            profile.avatarUrl,
                                            api.defaults.baseURL
                                        ).href
                                        : "/default-avatar.png"
                                }
                                alt={profile.username}
                                className="h-32 w-32 rounded-full object-cover sm:h-28 sm:w-28"
                            />
                        </div>

                        {/* Profile information */}
                        <div className="min-w-0 flex-1 text-center sm:text-left">
                            <h1 className="break-words text-2xl font-bold text-app-text">
                                {profile.displayName || profile.username}
                            </h1>

                            <p className="mt-1 break-all text-base text-app-muted sm:text-sm">
                                @{profile.username}
                            </p>

                            <p className="mt-5 whitespace-pre-wrap break-words text-base text-app-text sm:mt-4 sm:text-sm">
                                {profile.bio || "No bio yet"}
                            </p>
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex w-full flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-start sm:gap-2">
                        <button
                            type="button"
                            onClick={() => setShowFriends(true)}
                            className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-3 text-sm font-medium text-app-text transition-colors hover:bg-app-border sm:w-auto sm:rounded-lg sm:py-2"
                        >
                            Show Friends
                        </button>
                        
                        <ProfileActions
                            profile={profile}
                            onUpdate={refreshProfile}
                        />



                        {profile.id === user?.id && (
                            <button
                                type="button"
                                onClick={() => setShowRequests(true)}
                                className="w-full rounded-xl border border-app-border bg-app-surface px-4 py-3 text-sm font-medium text-app-text transition-colors hover:bg-app-border sm:w-auto sm:rounded-lg sm:py-2"
                            >
                                Friend Requests
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Friends popup */}
            {showFriends && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setShowFriends(false)}
                >
                    <div
                        className="flex w-full max-w-md flex-col overflow-hidden"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Friends"
                        onClick={event => event.stopPropagation()}
                    >
                        <div className="max-h-[70vh] overflow-y-auto p-2">
                            <ProfileFriends
                                userId={profile.id}
                                onClose={() => setShowFriends(false)}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Pending requests popup */}
            {showRequests && profile.id === user?.id && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setShowRequests(false)}
                >
                    <div
                        className="w-full max-w-md"
                        role="dialog"
                        aria-modal="true"
                        aria-label="Friend Requests"
                        onClick={event => event.stopPropagation()}
                    >
                        <PendingRequests
                            onClose={() => setShowRequests(false)}
                            onUpdate={refreshProfile}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}
