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
    try {
        const user = await prisma.user.findUnique({
            where: {
                id: addresseeId
            }
        })
        if (!user)
            return res.status(404).json({ message: "User not found" });
        if (requesterId === addresseeId)
            return res.status(400).json({message: "You cannot send a friend request to yourself"})
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
        if (friendship)
            return res.status(400).json({message: "A friendship already exists"})
        await prisma.friendship.create({
            data: {
                requesterId,
                addresseeId,
            }
        });
    return res.status(200).json({message: "friendship created"})   
    } catch (error) {
        return res.status(500).json({ message: "Internal server error" });
    }
}
