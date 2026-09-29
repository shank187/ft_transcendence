import { prisma } from "../../lib/prisma";

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

export async function getConversationMessages(conversationId: string) { 
    const messages = await prisma.message.findMany({
            where: {
                conversationId : conversationId
            },
            orderBy: {
                createdAt: "desc"
            },
            take: 50
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