import { prisma } from "../../lib/prisma"

export async function getFriendsForUser(userId: string) {
    const friendIds = await getFriendsId(userId)
    const friendsList = await prisma.user.findMany({
        where : {
            id : { in: friendIds}
        },
        select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            lastSeenAt: true
        }
    })
    return friendsList
}

export async function areUsersFriends(userA: string, userB: string)  {
    const friendship = await prisma.friendship.findFirst({
        where: {
            OR : [
                {
                    requesterId : userA,
                    addresseeId : userB,
                    status: "ACCEPTED"
                },
                {
                    requesterId : userB,
                    addresseeId : userA,
                    status: "ACCEPTED"
                }
            ]
        }
    })
    if (!friendship)
        return false
    return true
}

export const getFriendsId = async (userId: string) => {
    const friends = await prisma.friendship.findMany({
        where: {
            OR: [
                {
                    requesterId: userId,
                    status: "ACCEPTED"
                },
                {
                    addresseeId: userId,
                    status: "ACCEPTED"
                }
            ]
        }
    })
    const friendIds = friends.map(friendship => {
        if (friendship.requesterId === userId)
            return friendship.addresseeId
        return friendship.requesterId
    })
    return friendIds
}