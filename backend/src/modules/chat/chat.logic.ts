import { WebSocketServer } from 'ws'
import { ClientMessage, ServerMessage, AuthenticatedWebSocket } from './chat.type'
import jwt from "jsonwebtoken";
import { getFriendsId , areUsersFriends} from "../friends/friends.service";
import { storeMessage, setReadMessageTime } from "./chat.service"

export let connectedUsers = new Map<string, Set<AuthenticatedWebSocket>>()

function isValidMessage(message: unknown): message is ClientMessage {
    if (typeof message === "object" && message !== null) {
        if ("type" in message && message.type === "message") {
            return ("to" in message &&  "content" in message &&  typeof message.to === "string" &&
                typeof message.content === "string")
        }
        else if ("type" in message && message.type === "authenticate")
            return ("token" in message && typeof message.token === "string")
        else if ("type" in message && message.type === "readMessage")
            return ("target" in message && typeof message.target === "string" && 
                    "messageId" in message && typeof message.messageId === "string")
    }
    return false
}

async function handlePresence(ws: AuthenticatedWebSocket, status: "online" | "offline") {
    const friends = await getFriendsId(ws.userId)
    const response: ServerMessage = {
        type: "presence",
        userId: ws.userId,
        status: status
    }
    const onlineFriendIds = friends.filter(friend =>
        connectedUsers.has(friend)
    )

    onlineFriendIds.forEach( friendId => {
        connectedUsers.get(friendId)?.forEach( Socket => {
            Socket.send(JSON.stringify(response))
        })
    }
    )
}

async function sendPresenceSnapshot(ws: AuthenticatedWebSocket) {
    const friends = await getFriendsId(ws.userId)

    const onlineFriendIds = friends.filter(friendId =>
        connectedUsers.has(friendId)
    )

    const response: ServerMessage = {
        type: "presence_snapshot",
        onlineUserIds: onlineFriendIds
    }

    ws.send(JSON.stringify(response))
}

export function initializeChat(wss: WebSocketServer) {
    wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
        console.log(`client connected.`)
        ws.on('message', async rawData => {
            let message: unknown
            try {
                message = JSON.parse(rawData.toString())
            } catch {
                const response: ServerMessage = {
                    type: "error",
                    message: "Invalid JSON"
                }
                ws.send(JSON.stringify(response))
                return
            }
            if (!isValidMessage(message)) {
                const response: ServerMessage = {
                    type: "error",
                    message: "Invalid message"
                }
                ws.send(JSON.stringify(response))
                return
            }
            if (!ws.userId) {
                if (message.type !== "authenticate") {
                    ws.close(1008, "Authentication required");
                    return
                }
                try {
                    const secret = process.env.JWT_SECRET
                    if (!secret) {
                        ws.close(1011, "Server configuration error");
                        return
                    }
                    const decoded = jwt.verify(message.token, secret)
                    if (typeof decoded === "string" || typeof decoded.userId !== "string") {
                        ws.close(1008, "Invalid access token");
                        return
                    }
                    ws.userId = decoded.userId;
                    const response: ServerMessage = {
                        type: "authenticated",
                    }
                    ws.send(JSON.stringify(response))
                    if (!connectedUsers.has(ws.userId))
                        connectedUsers.set(ws.userId, new Set)
                    connectedUsers.get(ws.userId)?.add(ws)
                    await sendPresenceSnapshot(ws)
                    if (connectedUsers.get(ws.userId)?.size === 1)
                        await handlePresence(ws, "online")
                    return
                } catch {
                    ws.close(1008, "Invalid or expired access token");
                    return;
                }
            }
            else if (message.type === "authenticate") {
                const response: ServerMessage = {
                    type: "error",
                    message: "Already authenticated"
                }
                ws.send(JSON.stringify(response))
                return
            }
            else if (message.type === "readMessage") {
                if (!( await areUsersFriends(message.target, ws.userId)) || message.target === ws.userId) {
                    const response : ServerMessage = {
                        type: "error",
                        message: "You can only read messages from accepted friends"
                    }
                    ws.send(JSON.stringify(response))
                    return
                }
                const response = await setReadMessageTime(message.target, message.messageId, ws.userId)
                if (response.type === "error") {
                    connectedUsers.get(ws.userId)?.forEach( toSocket => {
                        toSocket.send(JSON.stringify(response))
                    })
                }
                else {
                    connectedUsers.get(message.target)?.forEach( toSocket => {
                        toSocket.send(JSON.stringify(response))
                    })
                }
                return
            }
            else if (message.type === "message") {
                if (message.to === ws.userId) {
                    const response : ServerMessage = {
                        type: "error",
                        message: "You can't message yourself"
                    }
                    ws.send(JSON.stringify(response))
                    return
                }
                if (!( await areUsersFriends(message.to, ws.userId))) {
                    const response : ServerMessage = {
                        type: "error",
                        message: "You can only message accepted friends"
                    }
                    ws.send(JSON.stringify(response))
                    return
                }
                const msgRecord = await storeMessage(message.to, message.content, ws.userId)
                const response : ServerMessage = {
                    type: "message",
                    from: ws.userId,
                    to: message.to,
                    content: message.content,
                    messageId: msgRecord.id,
                    conversationId: msgRecord.conversationId,
                    createdAt: msgRecord.createdAt,
                    readAt: null
                }
                connectedUsers.get(message.to)?.forEach( toSocket => {
                    toSocket.send(JSON.stringify(response))
                })
                connectedUsers.get(ws.userId)?.forEach(toSocket => {
                    toSocket.send(JSON.stringify(response))
                })
                console.log(
                    `Message received from user ${ws.userId}`
                );
            }
        })
        ws.on('close', async (code, reason) => {
            if (ws.userId) {
                connectedUsers.get(ws.userId)?.delete(ws)
                if (connectedUsers.get(ws.userId)?.size === 0) {
                        await handlePresence(ws, "offline")
                        connectedUsers.delete(ws.userId)
                }
            }
            console.log(`connection closed with ${code} and reason: ${reason}`)
        })
    })
}