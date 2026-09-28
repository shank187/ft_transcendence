import { AuthenticatedRequest } from "../../middleware/authenticate";
import { prisma } from "../../lib/prisma";
import { Response } from "express";

export const getFriends = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId

    try {
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
        return res.status(200).json(friendsList)
    } catch (error) {
        console.error(error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export const getPendingRequests = async (req: AuthenticatedRequest, res: Response) => {

}

export const getBlockedUsers = async (req: AuthenticatedRequest, res: Response) => {

}
