export type RelationshipStatus =
    | "SELF"
    | "NONE"
    | "FRIENDS"
    | "REQUEST_SENT"
    | "REQUEST_RECEIVED"
    | "BLOCKED_BY_ME"
    | "BLOCKED_BY_THEM"

export type PublicProfile = {
    id: string
    username: string
    displayName: string | null
    avatarUrl: string | null
    bio: string | null
    lastSeenAt: string | null
    friendsCount: number
    relationship: RelationshipStatus
    totalXp: number
    level: number
    achievements: {
        code: string
        unlockedAt: string
    }[]
}