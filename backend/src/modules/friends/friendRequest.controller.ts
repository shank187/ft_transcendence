import { AuthenticatedRequest } from "../../middleware/authenticate";
import { prisma } from "../../lib/prisma";
import { Response } from "express";

export const sendFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
    const requesterId = req.userId
    const { userId } = req.params;

    if (!requesterId)
        return res.status(401).json({ message: "Unauthorized" });
    //type narrowing
    if (typeof userId !== 'string')
        return res.status(400).json({ message: "Invalid user ID" });
    const addresseeId = userId;
    if (requesterId === addresseeId)
        return res.status(400).json({ message: "You cannot send a friend request to yourself" })
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: addresseeId
            }
        })
        if (!user)
            return res.status(404).json({ message: "User not found" });
        const friendship = await prisma.friendship.findFirst(
            {
                where: {
                    OR: [
                        {
                            requesterId,
                            addresseeId
                        },
                        {
                            requesterId: addresseeId,
                            addresseeId: requesterId
                        }
                    ]
                }
            }
        )
        if (friendship) {
            if (friendship.status === 'PENDING')
                return res.status(409).json({ message: "friendship Request already exists" })
            if (friendship.status === 'BLOCKED')
                return res.status(404).json({ message: "not found" })
            if (friendship.status === 'ACCEPTED')
                return res.status(409).json({ message: "friendship already exists" })
        }
        await prisma.friendship.create({
            data: {
                requesterId,
                addresseeId,
            }
        });
        return res.status(201).json({ message: "Friendship Request created" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const acceptFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
    const accepterId = req.userId
    const { userId } = req.params;

    if (!accepterId)
        return res.status(401).json({ message: "Unauthorized" });
    //type narrowing
    if (typeof userId !== 'string')
        return res.status(400).json({ message: "Invalid user ID" });
    const requestSenderId = userId;
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: requestSenderId
            }
        })
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (accepterId === requestSenderId)
            return res.status(400).json({ message: "You cannot accept a friend request from yourself" })
        const friendship = await prisma.friendship.findUnique(
            {
                where: {
                    requesterId_addresseeId: {
                        requesterId: requestSenderId,
                        addresseeId: accepterId
                    }
                }
            }
        )
        if (!friendship)
            return res.status(404).json({ message: "Friend request not found" })
        if (friendship.status === 'BLOCKED')
            return res.status(404).json({ message: "not found" })
        if (friendship.status === 'ACCEPTED')
            return res.status(409).json({ message: "You're already friend with this user" })
        if (friendship.status === 'PENDING') {
            await prisma.friendship.update({
                where: {
                    requesterId_addresseeId: {
                        requesterId: requestSenderId,
                        addresseeId: accepterId
                    }
                },
                data: {
                    status: 'ACCEPTED'
                }
            })
        }
        return res.status(200).json({ message: "Friendship request accepted" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" });
    }
}



export const rejectFriendRequest = async (req: AuthenticatedRequest, res: Response) => {
    const rejecterId = req.userId
    const { userId } = req.params

    if (!rejecterId)
        return res.status(401).json({ message: "Unauthorized" });
    //type narrowing
    if (typeof userId !== 'string')
        return res.status(400).json({ message: "Invalid user ID" });
    const requestSenderId = userId;
    try {
        const friendship = await prisma.friendship.findUnique(
            {
                where: {
                    requesterId_addresseeId: {
                        requesterId: requestSenderId,
                        addresseeId: rejecterId
                    }
                }
            }
        )
        if (!friendship)
            return res.status(404).json({ message: "Friend request not found" })
        if (friendship.status === 'BLOCKED')
            return res.status(404).json({ message: "not found" })
        if (friendship.status === 'ACCEPTED')
            return res.status(409).json({ message: "You're already friend with this user" })
        if (friendship.status === 'PENDING') {
            await prisma.friendship.delete({
                where: {
                    requesterId_addresseeId: {
                        requesterId: requestSenderId,
                        addresseeId: rejecterId
                    }
                }
            })
        }
        return res.status(200).json({ message: "Friendship request rejected" });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" });
    }
}