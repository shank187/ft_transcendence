
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
    const [connectionStatus , setConnectionStatus] = useState<"connecting" | "connected" | "disconnected" >("disconnected")
    const wsRef = useRef<WebSocket | null>(null);

    const [lastMessage, setLastMessage] =
        useState<ServerMessage | null>(null);

    const [onlineUserIds, setOnlineUserIds] =
        useState<string[]>([]);


    useEffect(() => {
        if (!accessToken) {
            setLastMessage(null);
            setOnlineUserIds([]);
            setConnectionStatus("disconnected");
            return;
        }

        let stopped = false;
        let retryTimer: number | undefined;
        let ws: WebSocket | null = null;

        function connect() {
            if (stopped) return;

            setConnectionStatus("connecting");

            const wsUrl = new URL("/chat", API_URL);
            wsUrl.protocol = wsUrl.protocol === "https:" ? "wss:" : "ws:";

            const connection = new WebSocket(wsUrl.toString());
            ws = connection;
            wsRef.current = connection;

            connection.onopen = () => {
                const message: ClientMessage = {
                    type: "authenticate",
                    token: accessToken!
                };

                connection.send(JSON.stringify(message));
            };

            connection.onmessage = (event) => {
                const message: ServerMessage = JSON.parse(event.data);

                setLastMessage(message);

                if (message.type === "authenticated") {
                    setConnectionStatus("connected");
                }
                else if (message.type === "presence_snapshot") {
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
                    else {
                        setOnlineUserIds(current =>
                            current.filter(id => id !== message.userId)
                        );
                    }
                }
            };

            connection.onclose = () => {
                if (wsRef.current !== connection || stopped) return;

                wsRef.current = null;
                setOnlineUserIds([]);
                setConnectionStatus("disconnected");

                retryTimer = setTimeout(connect, 3000);
            };

            connection.onerror = () => {
                // onclose normally follows a failed connection.
                // Reconnection is handled there.
                console.error("WebSocket connection error");
            };
        }

        connect();

        return () => {
            stopped = true;
            clearTimeout(retryTimer);

            if (ws) {
                ws.close();
                if (wsRef.current === ws)
                    wsRef.current = null;
            }
        };
    }, [accessToken]);


    return (
        <WebSocketContext.Provider
            value={{ wsRef, lastMessage, onlineUserIds, connectionStatus }}
        >
            {children}
        </WebSocketContext.Provider>
    );
}
