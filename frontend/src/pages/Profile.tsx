import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import { Users, UserPlus } from "lucide-react"
import { useAuth } from "../features/auth/AuthContext"
import api from "../features/auth/axiosInstance"
import type { PublicProfile } from "../features/profile/profile.types"
import ProfileActions from "../features/profile/ProfileActions"
import { useWebSocket } from "./WebSocketContext"
import ProfileFriends from "../features/profile/ProfileFriends"
import PendingRequests from "../features/profile/PendingRequests"
import PublicProfileProgress from "../features/profile/PublicProfileProgress"

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
            setProfile(null)
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
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                    {/* Avatar */}
                    <div className="shrink-0 self-center sm:self-start">
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
                            className="h-28 w-28 rounded-full object-cover"
                        />
                    </div>

                    {/* Profile information */}
                    <div className="min-w-0 flex-1 text-center sm:text-left">
                        <h1 className="break-words text-2xl font-bold text-app-text">
                            {profile.displayName || profile.displayName}
                        </h1>

                        <p className="mt-1 break-all text-sm text-app-muted">
                            @{profile.username}
                        </p>

                        <p className="mt-4 whitespace-pre-wrap break-words text-sm text-app-text">
                            {profile.bio || "No bio yet"}
                        </p>
                    </div>

                    {/* Friends buttons on the right */}
                    <div className="flex flex-wrap justify-center gap-3 sm:ml-auto sm:justify-end">
                        <button
                            type="button"
                            onClick={() => setShowFriends(true)}
                            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-app-border px-4 py-2.5 text-sm font-semibold text-app-text transition-colors hover:border-app-primary hover:bg-app-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary"
                        >
                            <Users
                                className="h-4 w-4 text-app-primary"
                                aria-hidden="true"
                            />
                            Friends
                            <span className="rounded-full bg-app-primary/10 px-2 py-0.5 text-xs text-app-primary">
                                {profile.friendsCount}
                            </span>
                        </button>

                        {profile.id === user?.id && (
                            <button
                                type="button"
                                onClick={() => setShowRequests(true)}
                                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-app-border px-4 py-2.5 text-sm font-semibold text-app-text transition-colors hover:border-app-primary hover:bg-app-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-app-primary"
                            >
                                <UserPlus
                                    className="h-4 w-4 text-app-primary"
                                    aria-hidden="true"
                                />
                                Friend requests
                            </button>
                        )}
                    </div>
                </div>

                {/* Edit profile / relationship actions below */}
                <div className="mt-6">
                    <ProfileActions
                        profile={profile}
                        onUpdate={refreshProfile}
                    />
                </div>
            </div>

            {/* XP, level and unlocked achievements */}
            <PublicProfileProgress profile={profile} />

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
                        onClick={(event) => event.stopPropagation()}
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
                        onClick={(event) => event.stopPropagation()}
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