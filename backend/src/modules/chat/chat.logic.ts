import { WebSocketServer } from 'ws'
import { ClientMessage, ServerMessage, AuthenticatedWebSocket } from './chat.type'
import jwt from "jsonwebtoken";


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


export function initializeChat(wss: WebSocketServer) {
    wss.on('connection', (ws: AuthenticatedWebSocket, req) => {
        console.log(`client connected.`)
        ws.on('message', rawData => {
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
                // send_message(ws, message.to, message.content)
                console.log(
                    `Message received from user ${ws.userId}`
                );
            }
        })
        ws.on('close', (code, reason) => {
            if (ws.userId) {
                connectedUsers.get(ws.userId)?.delete(ws)
                if (connectedUsers.get(ws.userId)?.size === 0)
                    connectedUsers.delete(ws.userId)

            }
            console.log(`connection closed with ${code} and reason: ${reason}`)
        })
    })
}