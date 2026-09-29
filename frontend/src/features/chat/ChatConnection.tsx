import { useEffect, useRef, useState } from "react";
import { useAuth } from "../auth/AuthContext";
import type { ClientMessage, ServerMessage } from "./Chat.type";

function ChatConnection() {
    const { accessToken } = useAuth();

    const wsRef = useRef<WebSocket | null>(null);

    const [recipientId, setRecipientId] = useState("");
    const [content, setContent] = useState("");

    function sendMessage() {
    console.log("wsRef:", wsRef.current);
    console.log("readyState:", wsRef.current?.readyState);
    console.log("OPEN:", WebSocket.OPEN);
        if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
            console.log("WebSocket is not connected");
            return;
        }

        const message: ClientMessage = {
            type: "message",
            to: recipientId,
            content: content,
        };

        wsRef.current.send(JSON.stringify(message));

        console.log("Message sent:", message);

        setContent("");
    }

    useEffect(() => {
        console.log("accessToken:", accessToken);
        if (!accessToken)
            return;

        const ws = new WebSocket("ws://localhost:3000/chat");

        wsRef.current = ws;

        ws.onopen = () => {
            console.log("WebSocket connected");

            const response: ClientMessage = {
                type: "authenticate",
                token: accessToken,
            };

            ws.send(JSON.stringify(response));
        };

        ws.onmessage = (event) => {
            const message: ServerMessage = JSON.parse(event.data);

            if (message.type === "authenticated")
                console.log("WebSocket authenticated");

            if (message.type === "error")
                console.log(message.message);

            if (message.type === "message")
                console.log(
                    `message from ${message.from} content: ${message.content}`
                );

            if (message.type === "presence")
                console.log(
                    `user ${message.userId} is ${message.status}`
                );
        };

ws.onclose = () => {
    console.log("WebSocket disconnected");

    if (wsRef.current === ws) {
        wsRef.current = null;
    }
};

return () => {
    ws.close();

    if (wsRef.current === ws) {
        wsRef.current = null;
    }
};
    }, [accessToken]);

    return (
        <div>
            <h2>WebSocket Test</h2>

            <input
                type="text"
                placeholder="Recipient user ID"
                value={recipientId}
                onChange={(event) => setRecipientId(event.target.value)}
            />

            <input
                type="text"
                placeholder="Message"
                value={content}
                onChange={(event) => setContent(event.target.value)}
            />

            <button onClick={sendMessage}>
                Send
            </button>
        </div>
    );
}

export default ChatConnection;