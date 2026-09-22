import { WebSocketServer } from 'ws'
import {clientMessages, ServerMessage} from './chat.type'


function isValidMessage(message: unknown): message is clientMessages {
    if (typeof message === "object" && message !== null) {
        return ((message as clientMessages).type === "message" &&
                typeof (message as clientMessages).to === "string" &&
                typeof (message as clientMessages).content === "string")
    }
    return false 
}


export function initializeChat(wss: WebSocketServer) {
    wss.on('connection', (ws, req) => {
        console.log(`client connected.`)
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
        })
        ws.on('close', (code , reason) => {
            console.log(`connection closed with ${code} and reason: ${reason}`)
        })
    })
}