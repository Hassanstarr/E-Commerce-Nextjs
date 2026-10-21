import { apiRequest } from "@/lib/api";
import type { ChatHistory, ChatInbox } from "@/types/chat";

export async function getMyChat() {
    return (await apiRequest<{ data: { conversationId: string } }>("/api/chat", { cache: "no-store" })).data;
}

export async function getChatHistory(id: string, before?: number) {
    return (await apiRequest<{ data: ChatHistory }>(`/api/chat/${id}/messages${before ? `?before=${before}` : ""}`, { cache: "no-store" })).data;
}

export async function getChatInbox(page: number, search: string, filter: string) {
    const params = new URLSearchParams({ page: String(page), search, filter });
    return (await apiRequest<{ data: ChatInbox }>(`/api/admin/chats?${params}`, { cache: "no-store" })).data;
}

export async function readChat(id: string, sequence: number) {
    await apiRequest(`/api/chat/${id}/read`, { method: "PATCH", body: JSON.stringify({ sequence }) });
}
