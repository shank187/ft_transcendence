
import { useState } from "react"
import { Link } from "react-router-dom"
import api from "../auth/axiosInstance"
import type { PublicProfile } from "./profile.types"
import Dialog from "../../components/ui/Dialog"
type ProfileActionsProps = {
    profile: PublicProfile
    onUpdate: () => Promise<void>
}

export default function ProfileActions({
    profile,
    onUpdate
}: ProfileActionsProps) {
    const [loading, setLoading] = useState(false)
    const [confirmAction, setConfirmAction] = useState<"block" | "remove" | null>(null)
    const [actionError, setActionError] = useState("")

    function openConfirmation(action: "block" | "remove") {
        setActionError("")
        setConfirmAction(action)
    }

    async function handleAction(
        method: "post" | "delete",
        endpoint: string
    ) {
        if (loading)
            return false

        setLoading(true)
        setActionError("")

        let actionCompleted = false
        try {
            if (method === "post")
                await api.post(endpoint)
            else
                await api.delete(endpoint)

            actionCompleted = true
            await onUpdate()
        } catch {
            if (!actionCompleted)
                setActionError("Couldn’t complete the action. Try again.")
        } finally {
            setLoading(false)
        }
        return actionCompleted
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



            {profile.relationship === "BLOCKED_BY_ME" && (
                <button
                    disabled={loading}
                    onClick={() =>
                        handleAction("post", `/api/friends/${userId}/unblock`)
                    }
                        className="w-full rounded-lg border border-red-600 px-4 py-2 text-center text-sm text-red-500 disabled:opacity-50 sm:w-auto"
                >
                    Unblock
                </button>
            )}
            {profile.relationship === "FRIENDS" && (
                <>
                                    <Link
                        to={`/social?userId=${profile.id}`}
                        className={greenButtonClass}
                    >
                        Message
                    </Link>
                    <button
                        disabled={loading}
                        onClick={() => openConfirmation("remove")}
                        className="w-full rounded-lg border border-red-600 px-4 py-2 text-center text-sm text-red-500 disabled:opacity-50 sm:w-auto"
                    >
                        Remove Friend
                    </button>


                </>
            )}
            {profile.relationship !== "BLOCKED_BY_ME" &&
                profile.relationship !== "BLOCKED_BY_THEM" && (
                    <button
                        disabled={loading}
                        onClick={() => openConfirmation("block")}
                        className="w-full rounded-lg border border-red-600 px-4 py-2 text-center text-sm text-red-500 disabled:opacity-50 sm:w-auto"
                    >
                        Block user
                    </button>
                )}

            {!confirmAction && actionError && (
                <p role="alert" className="text-sm text-red-500">{actionError}</p>
            )}
            {confirmAction && (
    <Dialog
        title={confirmAction === "block" ? "Block User" : "Remove Friend"}
        isWorking={loading}
        onClose={() => setConfirmAction(null)}
        showClose
    >
        <p className="text-sm text-app-text-secondary">
            {confirmAction === "block"
                ? "Are you sure you want to block this user?"
                : "Are you sure you want to remove this friend?"
            }
        </p>
        {actionError && (
            <p role="alert" className="text-sm text-red-500">{actionError}</p>
        )}

        <div className="flex justify-end gap-3">
            <button
                type="button"
                disabled={loading}
                onClick={() => {
                    setActionError("")
                    setConfirmAction(null)
                }}
                className="rounded-lg border border-app-border px-4 py-2"
            >
                Cancel
            </button>

            <button
                type="button"
                disabled={loading}
                onClick={async () => {
                    const completed = confirmAction === "block"
                        ? await handleAction("post", `/api/friends/${userId}/block`)
                        : await handleAction("delete", `/api/friends/${userId}/delete`)

                    if (completed)
                        setConfirmAction(null)
                }}
                className="w-full rounded-lg border border-red-600 px-4 py-2 text-center text-sm text-red-500 disabled:opacity-50 sm:w-auto"
            >
                {loading
                    ? "Processing..."
                    : confirmAction === "block"
                        ? "Block user"
                        : "Remove friend"
                }
            </button>
        </div>
    </Dialog>
)}
        </div>
    )
}
