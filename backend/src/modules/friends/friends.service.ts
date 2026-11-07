import { prisma } from "../../lib/prisma"
import { ServerMessage } from "../chat/chat.type"
import { connectedUsers, sendPresenceSnapshot } from "../chat/chat.logic"
 

export async function notifyFriendshipUpdate(
    userId: string,
    targetId: string
) {

    const response: ServerMessage = {
        type: "friendship_updated",
        userId
    }

    const sockets = connectedUsers.get(targetId)

    if (!sockets) {
        return
    }

    for (const socket of sockets) {
        if (socket.readyState !== WebSocket.OPEN)
            continue
        socket.send(JSON.stringify(response))

        await sendPresenceSnapshot(socket)
    }
}

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