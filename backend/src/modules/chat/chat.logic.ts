import { WebSocketServer } from 'ws'
import { ClientMessage, ServerMessage, AuthenticatedWebSocket } from './chat.type'
import jwt from "jsonwebtoken";
import { getFriendsId , areUsersFriends} from "../friends/friends.service";


let connectedUsers = new Map<string, Set<AuthenticatedWebSocket>>()

function isValidMessage(message: unknown): message is ClientMessage {
    if (typeof message === "object" && message !== null) {
        if ("type" in message && message.type === "message") {
            return ("to" in message &&  "content" in message &&  typeof message.to === "string" &&
                typeof message.content === "string")
        }
        else if ("type" in message && message.type === "authenticate")
            return ("token" in message && typeof message.token === "string")
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
    friends.forEach( friendId => {
        if (!connectedUsers.has(friendId))
            return
        if (connectedUsers.get(friendId)?.size !== 0)
            connectedUsers.get(friendId)?.forEach( Socket => {
                Socket.send(JSON.stringify(response))
            })
    }
    )
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
            else if (message.type === "message") {
                if (!( await areUsersFriends(message.to, ws.userId)))
                    return
                // send_message(ws, message.to, message.content)
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