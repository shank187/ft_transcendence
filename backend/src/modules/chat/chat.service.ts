import { prisma } from "../../lib/prisma";
import type {ServerMessage} from "./chat.type"

export async function setReadMessageTime(target: string,messageId: string,userId: string) {
    const conversation = await findConversation(target, userId)
    if (!conversation) {
        const response: ServerMessage = {
            type: "error",
            message: "Conversation not found"
        }
        return response
    }
    try {
        const message = await prisma.message.update({
            where: {
                conversationId: conversation?.id,
                id: messageId,
                readAt: null,
                senderId: target
        },
        data: {
            readAt: new Date()
        }
        
    })
        const response : ServerMessage = {
            type: "readMessage",
            readAt: message.readAt!.toISOString(),
            conversationId: conversation?.id,
            messageId: message.id
            
        }
        return response
    } catch (error) {
        const response : ServerMessage = {
            type: "error",
            message: "enternal server error"
        }
        return response
    }
}


export async function findConversation(user1: string, user2: string) {
    const [userA, userB] = user1.localeCompare(user2) < 0 ? [user1, user2] : [user2, user1];
    let conversation = await prisma.conversation.findUnique({
        where: {
            user1Id_user2Id: {
                user1Id: userA,
                user2Id: userB
            }
        }
    })
    return conversation
}

async function createConversation(user1: string, user2: string) {
    const [userA, userB] = user1.localeCompare(user2) < 0 ? [user1, user2] : [user2, user1];
    let conversation = await prisma.conversation.create({
        data: {
            user1Id: userA,
            user2Id: userB
        }
    })
    return conversation
}

export async function getConversationMessages(conversationId: string, num: number) {
    const messages = await prisma.message.findMany({
            where: {
                conversationId : conversationId
            },
            orderBy: {
                createdAt: "desc"
            },
            take: num
        })
    return messages
}

export async function storeMessage(recipientId: string, content: string, senderId: string) {
    let conversation = await findConversation(recipientId, senderId)
    if (!conversation)
        conversation = await createConversation(recipientId, senderId)
    let messageRecord = await prisma.message.create({
        data: {
            conversationId: conversation.id,
            senderId: senderId,
            content: content,
        }
    })
    return messageRecord
}
