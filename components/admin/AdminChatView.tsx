"use client";

import { useState } from "react";
import { HiOutlineChatBubbleLeftRight, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import ChatWindow from "@/components/chat/ChatWindow";
import CatalogPagination from "@/components/ui/CatalogPagination";
import { getPreviewConversations } from "@/lib/chat-preview";
import { paginateCatalog } from "@/lib/catalog";

export default function AdminChatView() {
    const [conversations, setConversations] = useState(getPreviewConversations);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [page, setPage] = useState(1);
    const [drafts, setDrafts] = useState<Record<string, string>>({});

    const unreadCount = conversations.filter((conversation) => conversation.unread > 0).length;
    const filteredConversations = conversations.filter((conversation) => {
        const query = search.trim().toLowerCase();
        const matchesSearch = [conversation.name, conversation.email, conversation.messages.at(-1)?.text || ""]
            .some((value) => value.toLowerCase().includes(query));
        return matchesSearch && (filter === "all" || conversation.unread > 0);
    });
    const pagination = paginateCatalog(filteredConversations, String(page), 20);
    const activeConversation = conversations.find((conversation) => conversation.id === selectedId);

    const handleSelect = (id: string) => {
        setSelectedId(id);
        setConversations((previous) => previous.map((conversation) =>
            conversation.id === id ? { ...conversation, unread: 0 } : conversation
        ));
    };

    const handleSend = (text: string) => {
        if (!activeConversation) return;

        const message = {
            id: crypto.randomUUID(),
            sender: "admin" as const,
            text,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        };

        setConversations((previous) => {
            const conversation = previous.find((item) => item.id === activeConversation.id);
            if (!conversation) return previous;

            return [
                { ...conversation, unread: 0, messages: [...conversation.messages, message] },
                ...previous.filter((item) => item.id !== conversation.id),
            ];
        });
    };

    return (
        <div className="grid h-[min(720px,calc(100dvh-14rem))] min-h-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside aria-label="Customer conversations" className={`min-h-0 min-w-0 flex-col border-gray-200 lg:border-r ${activeConversation ? "hidden lg:flex" : "flex"}`}>
                <div className="shrink-0 border-b border-gray-200 p-4">
                    <h2 className="mb-3 text-sm font-semibold text-gray-900">Sample conversations</h2>
                    <label htmlFor="chat-search" className="sr-only">Search conversations</label>
                    <div className="relative">
                        <HiOutlineMagnifyingGlass aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input id="chat-search" type="search" value={search} onChange={(event) => {
                            setSearch(event.target.value);
                            setPage(1);
                        }} placeholder="Search name, email, message..." className="w-full rounded-lg border border-gray-300 py-2.5 pl-9 pr-3 text-xs text-gray-900 outline-none transition focus:border-black focus:ring-1 focus:ring-black" />
                    </div>
                    <div aria-label="Conversation filters" className="mt-3 flex gap-2">
                        {(["all", "unread"] as const).map((value) => (
                            <button key={value} type="button" aria-pressed={filter === value} onClick={() => {
                                setFilter(value);
                                setPage(1);
                            }} className={`rounded-lg px-3 py-1.5 text-xs font-medium transition ${filter === value ? "bg-gray-900 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                                {value === "all" ? `All (${conversations.length})` : `Unread (${unreadCount})`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
                    {pagination.items.map((conversation) => {
                        const lastMessage = conversation.messages.at(-1);
                        return (
                            <button key={conversation.id} type="button" aria-pressed={selectedId === conversation.id} onClick={() => handleSelect(conversation.id)} className={`mb-1 flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${selectedId === conversation.id ? "bg-gray-100" : "hover:bg-gray-50"}`}>
                                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">{conversation.name.charAt(0)}</span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="truncate text-sm font-semibold text-gray-900">{conversation.name}</span>
                                        <span className="shrink-0 text-[10px] text-gray-400">{lastMessage?.time}</span>
                                    </span>
                                    <span className="mt-1 flex items-center gap-2">
                                        <span className="min-w-0 flex-1 truncate text-xs text-gray-500">{lastMessage?.sender === "admin" ? "You: " : ""}{lastMessage?.text || "No messages yet"}</span>
                                        {conversation.unread > 0 && <span aria-label={`${conversation.unread} unread messages`} className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-semibold text-white">{conversation.unread}</span>}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                    {pagination.total === 0 && (
                        <div role="status" className="px-4 py-12 text-center">
                            <p className="text-sm font-medium text-gray-900">No conversations found</p>
                            <p className="mt-2 text-xs leading-5 text-gray-500">Try a different search or select All.</p>
                        </div>
                    )}
                </div>
                <div className="shrink-0 px-3 pb-3">
                    <CatalogPagination pathname="/admin/chats" page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
                </div>
            </aside>

            <div className={`h-full min-h-0 min-w-0 ${activeConversation ? "block" : "hidden lg:block"}`}>
                {activeConversation ? (
                    <ChatWindow title={activeConversation.name} subtitle={activeConversation.email} messages={activeConversation.messages} sender="admin" draft={drafts[activeConversation.id] || ""} onDraftChange={(value) => setDrafts((previous) => ({ ...previous, [activeConversation.id]: value }))} onSend={handleSend} onBack={() => setSelectedId(null)} />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-gray-50 px-6 text-center">
                        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 text-gray-500"><HiOutlineChatBubbleLeftRight aria-hidden="true" className="h-8 w-8" /></div>
                        <h2 className="text-lg font-semibold text-gray-900">Your conversations, in one place</h2>
                        <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">Select a conversation to read messages and preview a reply.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
