import { WebSocketServer } from 'ws'

export function initializeChat(wss: WebSocketServer) {
    wss.on('connection', (ws, req) => {
        console.log("client connected.")
    })
}