
export type FriendData = {
    id: string;
    username: string;
    displayName: string | null;
    avatarUrl: string | null;
    lastSeenAt: string | null;
};

export type FriendsListProps = {
    friends: FriendData[];
    onSelectFriend?: (friend: FriendData) => void;
};

export type MessageData = {
    id?: string;
    senderId: string;
    content: string;
    createdAt: string;
    readAt: string | null;
};

export type MessageProps = {
    message: MessageData;
    myUserId: string;
};

export type ConversationData = {
    conversationId: string;
    user: FriendData;
    lastMessage: MessageData | null;
};

export type ConversationsListProps = {
    onSelectFriend: (friend: FriendData) => void;
};

export type ChatWindowProps = {
    friend: FriendData | null;
    onSendMessage: (recipientId: string, content: string) => void;
    lastMessage: ServerMessage | null;
};

export type ClientMessage =
    | {
        type: "authenticate";
        token: string;
    }
    | {
        type: "message";
        to: string;
        content: string;
    }
    | {
        type: "readMessage";
        target: string;
        messageId: string;
    };

export type ServerMessage =
    | {
        type: "authenticated";
    }
    | {
        type: "message";
        from: string;
        to: string;
        content: string;
        messageId: string;
        conversationId: string;
        createdAt: string;
    }
    | {
        type: "presence";
        userId: string;
        status: "online" | "offline";
    }
    | {
        type: "presence_snapshot";
        onlineUserIds: string[];
    }
    | {
        type: "readMessage";
        from: string;
        messageId: string;
        readAt: string;
    }
    | {
        type: "error";
        message: string;
    };
