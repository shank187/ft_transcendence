import { createContext } from "react"
import type { RefObject } from "react"
import type { ServerMessage } from "../features/chat/chat.types"

type WebSocketContextType = {
    wsRef: RefObject<WebSocket | null>
    lastMessage: ServerMessage | null
    onlineUserIds: string[]
}

export const WebSocketContext = createContext<WebSocketContextType | null>(null)

