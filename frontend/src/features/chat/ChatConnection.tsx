import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

function ChatConnection() {
    const { accessToken } = useAuth();

    useEffect(() => {
        if (!accessToken)
            return;

        const ws = new WebSocket("ws://localhost:3000/chat");

        ws.onopen = () => {
            console.log("WebSocket connected");

            ws.send(JSON.stringify({
                type: "authenticate",
                token: accessToken,
            }));
        };

        ws.onmessage = (event) => {
            const message = JSON.parse(event.data);

            if (message.type === "authenticated")
                console.log("WebSocket authenticated");
        };

        ws.onclose = () => {
            console.log("WebSocket disconnected");
        };

        return () => {
            ws.close();
        };
    }, [accessToken]);

    return null;
}
export default ChatConnection;