
import type { FriendsListProps } from "./chat.types"
import api from "../auth/axiosInstance"

export default function FriendsList({ friends, onSelectFriend }: FriendsListProps) {
    return (
        <section className="flex min-w-0 flex-col gap-4">
            <h2 className="text-center text-lg font-semibold text-app-text">
                Online friends
            </h2>

            {friends.length === 0 ? (
                <p className="py-4 text-center text-sm text-app-text-secondary">
                    No online friends.
                </p>
            ) : (
                <div className="flex min-w-0 gap-3 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                    {friends.map(friend => {
                        const avatar = friend.avatarUrl
                            ? new URL(friend.avatarUrl, api.defaults.baseURL).href
                            : "/default-avatar.png"

                        return (
                            <button
                                key={friend.id}
                                type="button"
                                onClick={() => onSelectFriend?.(friend)}
                                className="flex w-20 shrink-0 flex-col items-center gap-2"
                            >
                                <div className="relative">
                                    <img
                                        src={avatar}
                                        alt={friend.username}
                                        className="h-12 w-12 rounded-full border border-app-border object-cover"
                                    />

                                    <span className="absolute bottom-0 right-0 h-3.5 w-3.5 rounded-full border-2 border-app-surface bg-app-primary" />
                                </div>

                                <span className="w-full truncate text-center text-xs text-app-text-secondary">
                                    {friend.displayName ?? friend.username}
                                </span>
                            </button>
                        )
                    })}
                </div>
            )}
        </section>
    )
}
