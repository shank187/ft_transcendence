export type clientMessages = 
    | {
        type:"message"
        to: string
        content:string
    }
    | {
        type:"authenticate"
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
        username: string;
        status: "online" | "offline";
    }
    | {
        type: "error";
        message: string;
    }
    | {
        type: "authenticated"
    }