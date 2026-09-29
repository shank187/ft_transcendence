import { AuthenticatedRequest } from "../../middleware/authenticate";
import { Response } from "express";
import { areUsersFriends } from "../friends/friends.service"
import { findConversation, getConversationMessages } from "./chat.service"


export const getMessageHistory = async (req: AuthenticatedRequest, res: Response)  => {
    const userId = req.userId
    const { target } = req.params

    if (typeof target !== "string")
        return res.status(400).json({ message: "Invalid user ID" });
    try {
        if (! (await areUsersFriends(userId, target)))
            return res.status(404).json({ message: "You are not friends" })
        const conversation = await findConversation(userId, target)
        if (!conversation)
            return res.status(200).json([]);
        const messageHistory = await getConversationMessages(conversation.id)
        const history = messageHistory.reverse()
        return res.status(200).json(history)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" });
    }
}