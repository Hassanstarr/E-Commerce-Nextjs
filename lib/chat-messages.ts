import type { ChatMessage, ChatMessageData } from "@/types/chat";

export function displayChatMessage(message: ChatMessageData): ChatMessage {
    return { ...message, time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
}

export function mergeChatMessages(current: ChatMessage[], incoming: ChatMessageData[]) {
    const messages = new Map(current.map((message) => [message.id, message]));
    for (const message of incoming) messages.set(message.id, displayChatMessage(message));
    return Array.from(messages.values()).sort((first, second) => first.sequence - second.sequence);
}
