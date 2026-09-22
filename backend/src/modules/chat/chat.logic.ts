import { WebSocketServer } from 'ws'
import {clientMessages, ServerMessage} from './chat.type'
import jwt from "jsonwebtoken";


function isValidMessage(message: unknown): message is clientMessages {
    if (typeof message === "object" && message !== null) { 
        if ((message as clientMessages).type === "message") {
            return (typeof (message as clientMessages).to === "string" &&
                    typeof (message as clientMessages).content === "string")
        }
        else if ((message as clientMessages).type === "authenticate")
            return (typeof (message as clientMessages).token === "string")
    }
    return false 
}


export function initializeChat(wss: WebSocketServer) {
    wss.on('connection', (ws, req) => {
        console.log(`client connected.`)
        let userId:string | null = null
        ws.on('message', rawData => {
            let message :unknown
            try {
                message = JSON.parse(rawData.toString())
            } catch {
                const response : ServerMessage = {
                    type:"error",
                    message:"Invalid JSON"
                }
                ws.send(JSON.stringify(response))
                return
            }
            if (!isValidMessage(message)) {
                const response : ServerMessage = {
                    type:"error",
                    message:"Invalid message"
                }
                ws.send(JSON.stringify(response))
                return
            }
            if (!userId) {
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
                    userId = decoded.userId;
                    const response : ServerMessage = {
                        type:"authenticated",
                    }
                    ws.send(JSON.stringify(response))
                    return                 
                } catch {
                    ws.close(1008, "Invalid or expired access token");
                    return;
                }
            }
            if (message.type === "authenticate") {
                const response : ServerMessage = {
                    type:"error",
                    message:"Already authenticated"
                }
                ws.send(JSON.stringify(response))
                return
            }
            if (message.type === "message") {
                console.log(
                    `Message received from user ${userId}`
                );
            }
        })
        ws.on('close', (code , reason) => {
            console.log(`connection closed with ${code} and reason: ${reason}`)
        })
    })
}