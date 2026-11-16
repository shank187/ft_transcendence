
import { useEffect, useState } from "react"
import api from "../auth/axiosInstance"
import type { FriendData } from "../chat/chat.types"

type PendingRequestsProps = {
    onClose: () => void
    onUpdate: () => void
}

export default function PendingRequests({
    onClose,
    onUpdate
}: PendingRequestsProps) {
    const [requests, setRequests] = useState<FriendData[]>([])
    const [loading, setLoading] = useState(true)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [error, setError] = useState("")

    useEffect(() => {
        let cancelled = false

        async function fetchRequests() {
            try {
                const response = await api.get<FriendData[]>(
                    "/api/friends/pending_request"
                )

                if (!cancelled)
                    setRequests(response.data)
            } catch (error) {
                console.error("Failed to fetch requests:", error)

                if (!cancelled)
                    setError("Failed to load friend requests")
            } finally {
                if (!cancelled)
                    setLoading(false)
            }
        }

        fetchRequests()

        return () => {
            cancelled = true
        }
    }, [])

    async function handleRequest(
        userId: string,
        action: "accept" | "reject"
    ) {
        if (processingId)
            return

        setProcessingId(userId)
        setError("")

        try {
            await api.post(`/api/friends/${userId}/${action}`)

            setRequests(current =>
                current.filter(request => request.id !== userId)
            )

            onUpdate()
        } catch (error) {
            console.error(error)
            setError(`Failed to ${action} friend request`)
        } finally {
            setProcessingId(null)
        }
    }

    return (
        <div className="w-full rounded-xl border border-app-border bg-app-surface shadow-xl">

            {/* Header */}
            <div className="flex items-center justify-between border-b border-app-border p-4">
                <h2 className="text-lg font-semibold text-app-text">
                    Friend Requests
                </h2>

                <button
                    type="button"
                    onClick={onClose}
                    className="text-app-muted hover:text-app-text"
                >
                    ✕
                </button>
            </div>

            {/* Requests */}
            <div className="max-h-[60vh] overflow-y-auto p-4">

                {loading ? (
                    <p className="text-center text-sm text-app-muted">
                        Loading requests...
                    </p>
                ) : error && requests.length === 0 ? (
                    <p className="text-center text-sm text-red-400">
                        {error}
                    </p>
                ) : requests.length === 0 ? (
                    <p className="py-6 text-center text-sm text-app-muted">
                        No pending friend requests
                    </p>
                ) : (
                    <div className="flex flex-col gap-4">
                        {requests.map(request => {
                            const avatar = request.avatarUrl
                                ? new URL(
                                    request.avatarUrl,
                                    api.defaults.baseURL
                                ).href
                                : "/default-avatar.png"

                            return (
                                <div
                                    key={request.id}
                                    className="flex flex-wrap items-center gap-3"
                                >
                                    <img
                                        src={avatar}
                                        alt={request.username}
                                        className="h-11 w-11 shrink-0 rounded-full object-cover"
                                    />

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-app-text">
                                            {request.displayName || request.username}
                                        </p>
                                        <p className="truncate text-xs text-app-muted">
                                            @{request.username}
                                        </p>
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            disabled={processingId !== null}
                                            onClick={() =>
                                                handleRequest(request.id, "accept")
                                            }
                                            className="rounded-lg bg-green-600 px-3 py-2 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                                        >
                                            Accept
                                        </button>

                                        <button
                                            type="button"
                                            disabled={processingId !== null}
                                            onClick={() =>
                                                handleRequest(request.id, "reject")
                                            }
                                            className="rounded-lg border border-app-border px-3 py-2 text-xs font-medium text-app-text hover:bg-app-border disabled:opacity-50"
                                        >
                                            Reject
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                )}

                {error && requests.length > 0 && (
                    <p className="mt-3 text-center text-sm text-red-400">
                        {error}
                    </p>
                )}
            </div>
        </div>
    )
}
