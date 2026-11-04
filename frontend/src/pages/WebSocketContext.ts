import { createContext, useContext  } from "react"
import type { RefObject } from "react"
import type { ServerMessage } from "../features/chat/chat.types"

type WebSocketContextType = {
    wsRef: RefObject<WebSocket | null>
    lastMessage: ServerMessage | null
    onlineUserIds: string[]
    connectionStatus: "connecting" | "connected" | "disconnected";
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null)

export function useWebSocket() {
    const context = useContext(WebSocketContext)

    if (!context)
        throw new Error("useWebSocket must be used inside WebSocketProvider")

    return context
}