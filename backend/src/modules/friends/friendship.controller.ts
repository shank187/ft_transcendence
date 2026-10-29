import { AuthenticatedRequest } from "../../middleware/authenticate";
import { prisma } from "../../lib/prisma";
import { Response } from "express";

export const deleteFriendship = async (req: AuthenticatedRequest, res: Response) => {
    const deleterId = req.userId
    const { userId } = req.params

    if (!deleterId)
        return res.status(401).json({ message: "Unauthorized" });
    //type narrowing
    if (typeof userId !== 'string')
        return res.status(400).json({ message: "Invalid user ID" });
    const otherFriend = userId;
    try {
        const friendship = await prisma.friendship.findFirst(
            {
                where: {
                    OR: [
                        {
                            requesterId: otherFriend,
                            addresseeId: deleterId
                        },
                        {
                            requesterId: deleterId,
                            addresseeId: otherFriend
                        }
                    ]
                }
            }
        )
        if (!friendship)
            return res.status(404).json({ message: "Friendship doesn't exist" })
        if (friendship.status === 'BLOCKED')
            return res.status(404).json({ message: "not found" })
        if (friendship.status === 'PENDING')
            return res.status(409).json({ message: "You're not a friend with this user" })
        await prisma.friendship.delete({
            where: {
                requesterId_addresseeId: {
                    requesterId: friendship.requesterId,
                    addresseeId: friendship.addresseeId
                }
            }
        })
        return res.status(200).json({ message: "Friendship deleted" });
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" });
    }
}


export const return_uses_id = async (req: AuthenticatedRequest, res: Response) => {
    const users = prisma.user.findMany({
        select: {
            id: true
        }
    })
    const users_Ids = (await users).map(user => user.id)
    res.json({ users_Ids })
}
