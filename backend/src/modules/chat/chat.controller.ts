import { AuthenticatedRequest } from "../../middleware/authenticate";
import { Response } from "express";
import { areUsersFriends } from "../friends/friends.service"
import { findConversation, getConversationMessages } from "./chat.service"
import { prisma } from "../../lib/prisma";


export async function getConversationsList(req: AuthenticatedRequest, res: Response) {
    const userId = req.userId
    try {
        const conversations = await prisma.conversation.findMany({
            where: {
                OR : [
                    {
                        user1Id:userId
                    },
                    {
                        user2Id:userId
                    }
                ]
            },
            select: {
                id: true,
                user1: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,
                        lastSeenAt: true,
                    }
                },
                user2: {
                    select: {
                        id: true,
                        username: true,
                        displayName: true,
                        avatarUrl: true,  
                        lastSeenAt: true,
                    }
                },
                messages: {
                    orderBy: {
                        createdAt: "desc"
                    },
                    take:1
                }
            }
        })
        const conversationsList = conversations.map(conversation => {
            const otherUser = userId === conversation.user1.id ? conversation.user2 : conversation.user1
            return {
                conversationId: conversation.id,
                user: otherUser,
                lastMessage: conversation.messages[0] ?? null
            }
        })
        conversationsList.sort((con1, con2) => {
            if (!con1.lastMessage && !con2.lastMessage)
                return 0
            if (!con1.lastMessage)
                return 1
            if (!con2.lastMessage)
                return -1
            return con2.lastMessage.createdAt.getTime() - con1.lastMessage.createdAt.getTime()
        })
        return res.status(200).json(conversationsList)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" });
    }
} 



export const getMessageHistory = async (req: AuthenticatedRequest, res: Response)  => {
    const userId = req.userId
    const { target } = req.params
    
    if (!userId)
        return res.status(401).json({ message: "Unauthorized" })
    if (typeof target !== "string" || target === userId)
        return res.status(400).json({ message: "Invalid user ID" });
    try {
        if (! (await areUsersFriends(userId, target)))
            return res.status(404).json({ message: "You are not friends" })
        const conversation = await findConversation(userId, target)
        if (!conversation)
            return res.status(200).json([]);
        const messageHistory = await getConversationMessages(conversation.id, 50)
        const history = messageHistory.reverse()
        return res.status(200).json(history)
    } catch (error) {
        console.error(error)
        return res.status(500).json({ message: "Internal server error" });
    }
}