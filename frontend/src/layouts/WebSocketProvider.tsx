
import { useState, useEffect, useRef } from "react";
import type { ReactNode } from "react";

import { useAuth } from "../features/auth/AuthContext";
import { WebSocketContext } from "../pages/WebSocketContext";
import type { ClientMessage, ServerMessage } from "../features/chat/chat.types";
import { API_URL } from "../features/auth/axiosInstance";

type WebSocketProviderProps = {
    children: ReactNode;
};

export default function WebSocketProvider({
    children
}: WebSocketProviderProps) {

    const { accessToken } = useAuth();

    const wsRef = useRef<WebSocket | null>(null);

    const [lastMessage, setLastMessage] =
        useState<ServerMessage | null>(null);

    const [onlineUserIds, setOnlineUserIds] =
        useState<string[]>([]);

    useEffect(() => {
        if (!accessToken) {
            setLastMessage(null);
            setOnlineUserIds([]);
            return;
        }
        const wsUrl = new URL("chat", API_URL)
        wsUrl.protocol = wsUrl.protocol === "https:" ? "wss" : "ws"
        const ws = new WebSocket(wsUrl.toString());
        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected successfully");
            const message: ClientMessage = {
                type: "authenticate",
                token: accessToken
            };

            ws.send(JSON.stringify(message));
        };

        ws.onmessage = (event) => {
            const message: ServerMessage = JSON.parse(event.data);
             console.log("WebSocket received:", message);

            setLastMessage(message);

            if (message.type === "presence_snapshot") {
                setOnlineUserIds(message.onlineUserIds);
            }
            else if (message.type === "presence") {
                if (message.status === "online") {
                    setOnlineUserIds(current =>
                        current.includes(message.userId)
                            ? current
                            : [...current, message.userId]
                    );
                }
                else if (message.status === "offline") {
                    setOnlineUserIds(current =>
                        current.filter(id => id !== message.userId)
                    );
                }
            }
        };

        ws.onclose = () => {
            if (wsRef.current === ws) {
                wsRef.current = null;
                setOnlineUserIds([])
            }
        };

        return () => {
            ws.close();

            if (wsRef.current === ws)
                wsRef.current = null;
        };

    }, [accessToken]);

    return (
        <WebSocketContext.Provider
            value={{ wsRef, lastMessage, onlineUserIds }}
        >
            {children}
        </WebSocketContext.Provider>
    );
}
