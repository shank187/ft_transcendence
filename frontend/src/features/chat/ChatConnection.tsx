import { useEffect } from "react";
import { useAuth } from "../auth/AuthContext";
import type {clientMessages, ServerMessage} from './Chat.type'

function ChatConnection() {
    const { accessToken } = useAuth();

    useEffect(() => {
        if (!accessToken)
            return;

        const ws = new WebSocket("ws://localhost:3000/chat");
        ws.onopen = () => {
            console.log("WebSocket connected");
            const respons : clientMessages = {
                type: "authenticate",
                token: accessToken,
            }  
            ws.send(JSON.stringify(respons));
        };

        ws.onmessage = (event) => {
            let message : ServerMessage = JSON.parse(event.data);
            if (message.type === "authenticated")
                console.log("WebSocket authenticated");
            if (message.type === "error") {
                console.log(`${message.message}`);
            }
            if (message.type === "message") {
                console.log(`message from ${message.from} content : ${message.content}`);
            }
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