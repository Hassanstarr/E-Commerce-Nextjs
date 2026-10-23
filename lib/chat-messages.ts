import type { ChatMessage, ChatMessageData } from "@/types/chat";

export function displayChatMessage(message: ChatMessageData): ChatMessage {
    return { ...message, time: new Date(message.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) };
}

export function mergeChatMessages(current: ChatMessage[], incoming: ChatMessageData[]) {
    const messages = new Map<string, ChatMessage>();
    const clientIds = new Map<string, string>();
    for (const message of [...current, ...incoming]) {
        const key = message.clientMessageId ? `${message.conversationId}:${message.sender}:${message.clientMessageId}` : "";
        const previousId = key ? clientIds.get(key) : undefined;
        const previous = previousId ? messages.get(previousId) : undefined;
        if (previous && !previous.delivery && message.delivery) continue;
        if (previousId && previousId !== message.id) messages.delete(previousId);
        messages.set(message.id, displayChatMessage(message));
        if (key) clientIds.set(key, message.id);
    }
    return Array.from(messages.values()).sort((first, second) => first.sequence - second.sequence);
}
