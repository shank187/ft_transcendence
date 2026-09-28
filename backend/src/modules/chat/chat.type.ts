import { WebSocket } from "ws";

export interface AuthenticatedWebSocket extends WebSocket {
    userId?: string;
}

export type ClientMessage =
    | {
        type: "message"
        to: string
        content: string
    }
    | {
        type: "authenticate"
        token: string
    } 

export type ServerMessage =
    | {
        type: "message";
        from: string;
        content: string;
    }
    | {
        type: "presence";
        userId?: string;
        status: "online" | "offline";
    }
    | {
        type: "error";
        message: string;
    }
    | {
        type: "authenticated"
    }
