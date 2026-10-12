import { AuthenticatedRequest } from "../../middleware/authenticate";
import { prisma } from "../../lib/prisma";
import { Response } from "express";

export const blockUser = async (req: AuthenticatedRequest, res: Response) => {
    const blockerId = req.userId
    const { userId } = req.params;

    if (!blockerId)
        return res.status(401).json({ message: "Unauthorized" });
    //type narrowing
    if (typeof userId !== 'string')
        return res.status(400).json({ message: "Invalid user ID" });
    const addresseeId = userId;
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: addresseeId
            }
        })
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (blockerId === addresseeId)
            return res.status(400).json({ message: "You cannot block yourself" })
        const friendship = await prisma.friendship.findFirst(
            {
                where: {
                    OR: [
                        {
                            requesterId: blockerId,
                            addresseeId
                        },
                        {
                            requesterId: addresseeId,
                            addresseeId: blockerId
                        }
                    ]
                }
            }
        )
        if (!friendship) {
            await prisma.friendship.create({
                data: {
                    requesterId: blockerId,
                    addresseeId,
                    status: 'BLOCKED',
                    blockedById: blockerId
                }
            });
        }
        else if (friendship.status === 'PENDING' || friendship.status === 'ACCEPTED') {
            await prisma.friendship.update({
                where: {
                    requesterId_addresseeId: {
                        requesterId: friendship.requesterId,
                        addresseeId: friendship.addresseeId
                    }
                },
                data: {
                    status: 'BLOCKED',
                    blockedById: blockerId
                }
            });
        }
        else if (friendship.status === 'BLOCKED') {
            if (friendship.blockedById === blockerId)
                return res.status(409).json({ message: "you already blocked the user" })
            return res.status(404).json({ message: "not found" })
        }
        return res.status(201).json({ message: "User was blocked successfully" })
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" });
    }
}

export const unblockUser = async (req: AuthenticatedRequest, res: Response) => {
    const unblockerId = req.userId
    const { userId } = req.params;

    if (!unblockerId)
        return res.status(401).json({ message: "Unauthorized" });
    //type narrowing
    if (typeof userId !== 'string')
        return res.status(400).json({ message: "Invalid user ID" });
    const addresseeId = userId;
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: addresseeId
            }
        })
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (unblockerId === addresseeId)
            return res.status(400).json({ message: "You cannot unblock yourself" })
        const friendship = await prisma.friendship.findFirst(
            {
                where: {
                    OR: [
                        {
                            requesterId: unblockerId,
                            addresseeId
                        },
                        {
                            requesterId: addresseeId,
                            addresseeId: unblockerId
                        }
                    ]
                }
            }
        )
        if (!friendship || friendship.status === 'PENDING' || friendship.status === 'ACCEPTED')
            return res.status(409).json({ message: "user is not blocked" })
        if (friendship.status === 'BLOCKED') {
            if (friendship.blockedById === unblockerId) {
                await prisma.friendship.delete({
                    where: {
                        requesterId_addresseeId: {
                            requesterId: friendship.requesterId,
                            addresseeId: friendship.addresseeId
                        }
                    }
                })
                return res.status(200).json({ message: "User was unblocked successfully" })
            }
            else
                return res.status(404).json({ message: "not found" })
        }
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" });
    }
}