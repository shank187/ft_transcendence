import { AuthenticatedRequest } from "../../middleware/authenticate";
import { Response } from "express";
import { getFriendsForUser } from "./friends.service";

export const getFriends = async (req: AuthenticatedRequest, res: Response) => {
    const userId = req.userId
    if (!userId)
            return res.status(401).json({ message: "Unauthorized" })
    try {
        const friendsList = await getFriendsForUser(userId)
        return res.status(200).json(friendsList)
    } catch (error) {
        console.error(error)
        return res.status(500).json({message: "Internal server error"})
    }
}

export const getUserFriends = async (req: AuthenticatedRequest, res: Response) => {
    const callerId = req.userId
    if (!callerId)
            return res.status(401).json({ message: "Unauthorized" })
    const { userId } = req.params
    if (typeof userId !== "string")
        return res.status(400).json({ message: "Invalid user ID" });
    try {
        const friendsList = await getFriendsForUser(userId)
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
