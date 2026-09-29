import { prisma } from "../../lib/prisma";
import { AuthenticatedWebSocket } from './chat.type'

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
            user2Id :userB,
        }
    })
    return conversation
}


export async function sendMessage(to: string, content: string, ws: AuthenticatedWebSocket) {
    let conversation = await findConversation(to, ws.userId)
    if (!conversation)
        conversation = await createConversation(to, ws.userId)
    let messageRecord = await prisma.message.create({
        data: {
            conversationId: conversation.id,
            senderId: ws.userId,
            content: content,
        }
    })
    return messageRecord
}