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
        messageId: string;
        conversationId: string;
        createdAt: Date;
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
