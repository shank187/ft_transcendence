
import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../auth/axiosInstance"
import type { PublicProfile } from "./profile.types"

type ProfileActionsProps = {
    profile: PublicProfile
    onUpdate: () => Promise<void>
}

export default function ProfileActions({
    profile,
    onUpdate
}: ProfileActionsProps) {
    const [loading, setLoading] = useState(false)
    async function handleAction(
        method: "post" | "delete",
        endpoint: string
    ) {
        if (loading)
            return

        setLoading(true)

        try {
            if (method === "post")
                await api.post(endpoint)
            else
                await api.delete(endpoint)

            await onUpdate()
        } catch (error) {
            console.error("Profile action failed:", error)
        } finally {
            setLoading(false)
        }
    }
function handleBlockUser(userId: string) {
    const isConfirmed = window.confirm(
        "Are you sure you want to block this user?"
    )

    if (!isConfirmed)
        return

    void handleAction("post", `/api/friends/${userId}/block`)
}
function handleRemoveFriend(userId: string) {
    const isConfirmed = window.confirm(
        "Are you sure you want to remove this friend?"
    )

    if (!isConfirmed)
        return

    void handleAction("delete", `/api/friends/${userId}/delete`)
}
    const userId = profile.id

    const buttonClass =
        "w-full sm:w-auto rounded-lg border border-app-border px-4 py-2 text-sm text-app-text disabled:opacity-50 text-center"

    const greenButtonClass =
        "w-full sm:w-auto rounded-lg bg-green-700 px-4 py-2 text-sm text-white disabled:opacity-50 text-center"

    if (profile.relationship === "SELF") {
        return (
            <Link
                to="/profile/settings"
                className={buttonClass}
            >
                Edit Profile
            </Link>
        )
    }

    return (
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap">
            {profile.relationship === "NONE" && (
                <button
                    disabled={loading}
                    onClick={() =>
                        handleAction("post", `/api/friends/${userId}/request`)
                    }
                    className={greenButtonClass}
                >
                    Add Friend
                </button>
            )}

            {profile.relationship === "REQUEST_SENT" && (
                <button
                    disabled={loading}
                    onClick={() =>
                        handleAction("delete", `/api/friends/${userId}/cancel_request`)
                    }
                    className={buttonClass}
                >
                    Cancel request
                </button>
            )}

            {profile.relationship === "REQUEST_RECEIVED" && (
                <>
                    <button
                        disabled={loading}
                        onClick={() =>
                            handleAction("post", `/api/friends/${userId}/accept`)
                        }
                        className={greenButtonClass}
                    >
                        Accept
                    </button>

                    <button
                        disabled={loading}
                        onClick={() =>
                            handleAction("post", `/api/friends/${userId}/reject`)
                        }
                        className={buttonClass}
                    >
                        Reject
                    </button>
                </>
            )}

            {profile.relationship === "FRIENDS" && (
                <>
                    <button
                        disabled={loading}
                        onClick={() => (handleRemoveFriend(userId))}
                        className={buttonClass}
                    >
                        Remove Friend
                    </button>

                    <Link
                        to={`/social?userId=${profile.id}`}
                        className={greenButtonClass}
                    >
                        Message
                    </Link>
                </>
            )}

            {profile.relationship === "BLOCKED_BY_ME" && (
                <button
                    disabled={loading}
                    onClick={() =>
                        handleAction("post", `/api/friends/${userId}/unblock`)
                    }
                    className={buttonClass}
                >
                    Unblock
                </button>
            )}

            {profile.relationship !== "BLOCKED_BY_ME" &&
                profile.relationship !== "BLOCKED_BY_THEM" && (
                    <button
                        disabled={loading}
                        onClick={() => {handleBlockUser(userId)}}
                        className="w-full rounded-lg border border-red-600 px-4 py-2 text-center text-sm text-red-500 disabled:opacity-50 sm:w-auto"
                    >
                        Block
                    </button>
                )}
        </div>
    )
}
