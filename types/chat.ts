export type ChatMessage = {
    id: string;
    sender: "user" | "admin";
    text: string;
    time: string;
};

export type ChatConversation = {
    id: string;
    name: string;
    email: string;
    unread: number;
    messages: ChatMessage[];
};
