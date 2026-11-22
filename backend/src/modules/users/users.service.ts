import { prisma } from "../../lib/prisma";


export async function getPublicProfile(username: string) {
    const user = await prisma.user.findUnique({
        where: { username },
        select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            lastSeenAt: true,
            _count: {
                select: {
                    sentFriendships: {
                        where: { status: "ACCEPTED" }
                    },
                    receivedFriendships: {
                        where: { status: "ACCEPTED" }
                    }
                }
            }
        }
    })

    if (!user)
        return null

    const friendsCount =
        user._count.sentFriendships +
        user._count.receivedFriendships

    const { _count, ...profile } = user

    return {
        ...profile,
        friendsCount
    }
}

export async function getName(
    searchedName: string,
    userId: string,
    cursor?: string
) {

    return prisma.user.findMany({
        where: {
    id: {
        not: userId
    },
    OR: [
        {
            username: {
                contains: searchedName,
                mode: "insensitive"
            }
        },
        {
            displayName: {
                contains: searchedName,
                mode: "insensitive"
            }
        }
    ]
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true
        },
        orderBy: [
            { username: "asc" },
            { id: "asc" }
        ],
        take: 11,
        cursor: cursor ? { id: cursor } : undefined,
        skip: cursor ? 1 : undefined
    })
}