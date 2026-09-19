import { WebSocketServer } from 'ws'

export function initializeChat(wss: WebSocketServer) {
    wss.on('connection', (ws, req) => {
        console.log(`client connected.`)
        ws.on('close', (code , reason) => {
            console.log(`connection closed with ${code} and reason: ${reason}`)
        })
    })
}