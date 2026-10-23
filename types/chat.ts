export type ChatIdentity = {
    userId: string;
    role: "user" | "admin";
};

export type ChatMessageData = {
    id: string;
    conversationId: string;
    sequence: number;
    sender: "user" | "admin" | "bot";
    text: string;
    createdAt: string;
    clientMessageId?: string;
    delivery?: "queued" | "sending" | "failed";
    deliveryError?: string;
};

export type ChatMessage = ChatMessageData & {
    time: string;
};

export type ChatConversation = {
    id: string;
    name: string;
    email: string;
    unread: number;
    messages: ChatMessage[];
};

export type ChatHistory = {
    conversationId: string;
    messages: ChatMessageData[];
    hasMore: boolean;
    nextBefore: number | null;
    sequence: number;
};

export type ChatInbox = {
    conversations: ChatConversation[];
    counts: { all: number; unread: number };
    pagination: { page: number; total: number; totalPages: number };
};

export type ChatServerEvent =
    | { type: "ready"; adminOnline: boolean; botAvailable: boolean }
    | { type: "presence"; adminOnline: boolean; botAvailable: boolean }
    | { type: "assistant"; conversationId: string; thinking: boolean }
    | { type: "changed"; conversationId: string }
    | { type: "ack"; requestId: string; message: ChatMessageData }
    | { type: "error"; requestId?: string; message: string; status?: number };
