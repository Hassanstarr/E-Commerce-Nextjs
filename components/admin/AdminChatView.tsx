"use client";

import { useEffect, useMemo, useState } from "react";
import { HiOutlineChatBubbleLeftRight, HiOutlineMagnifyingGlass } from "react-icons/hi2";
import ChatWindow from "@/components/chat/ChatWindow";
import CatalogPagination from "@/components/ui/CatalogPagination";
import { useAdminChatConnection } from "@/components/admin/AdminChatProvider";
import useChatHistory from "@/hooks/useChatHistory";
import { getChatInbox } from "@/services/chat.api";
import { displayChatMessage, mergeChatMessages } from "@/lib/chat-messages";
import type { ChatConversation } from "@/types/chat";

export default function AdminChatView() {
    const connection = useAdminChatConnection();
    const [conversations, setConversations] = useState<ChatConversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<ChatConversation | null>(null);
    const [search, setSearch] = useState("");
    const [filter, setFilter] = useState<"all" | "unread">("all");
    const [page, setPage] = useState(1);
    const [drafts, setDrafts] = useState<Record<string, string>>({});
    const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 1 });
    const [counts, setCounts] = useState({ all: 0, unread: 0 });
    const [loadingInbox, setLoadingInbox] = useState(true);
    const [inboxError, setInboxError] = useState("");
    const [sendError, setSendError] = useState("");
    const [refresh, setRefresh] = useState(0);
    const selectedId = activeConversation?.id || null;
    const history = useChatHistory(selectedId || "", connection.sync, refresh);
    const { reconcileMessages, messages: outgoingMessages } = connection;
    const messages = useMemo(() => mergeChatMessages(history.history.messages, outgoingMessages.filter((message) => message.conversationId === selectedId)), [history.history.messages, outgoingMessages, selectedId]);

    useEffect(() => { reconcileMessages(history.history.messages); }, [history.history.messages, reconcileMessages]);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            setLoadingInbox(true);
            void getChatInbox(page, search, filter).then((data) => {
                if (cancelled) return;
                if (page > data.pagination.totalPages) { setPage(data.pagination.totalPages); return; }
                const items = data.conversations.map((conversation) => ({ ...conversation, messages: conversation.messages.map(displayChatMessage) }));
                setConversations(items);
                setPagination(data.pagination);
                setCounts(data.counts);
                setInboxError("");
                setActiveConversation((previous) => previous ? items.find((item) => item.id === previous.id) || previous : null);
            }).catch((error) => {
                if (!cancelled) setInboxError(error instanceof Error ? error.message : "Unable to load conversations");
            }).finally(() => { if (!cancelled) setLoadingInbox(false); });
        }, 250);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [page, search, filter, connection.sync.revision, refresh]);

    const handleSelect = (conversation: ChatConversation) => {
        setActiveConversation(conversation);
        setSendError("");
    };

    const handleSend = async (text: string) => {
        if (!activeConversation) throw new Error("Select a conversation first");
        setSendError("");
        try {
            await connection.sendMessage(activeConversation.id, text);
        } catch (error) {
            setSendError(error instanceof Error ? error.message : "Unable to send message");
            throw error;
        }
    };

    return (
        <div className="grid h-[min(720px,calc(100dvh-14rem))] min-h-100 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm lg:grid-cols-[300px_minmax(0,1fr)]">
            <aside aria-label="Customer conversations" className={`min-h-0 min-w-0 flex-col border-gray-200 lg:border-r ${activeConversation ? "hidden lg:flex" : "flex"}`}>
                <div className="shrink-0 border-b border-gray-200 p-4">
                    <h2 className="mb-3 text-sm font-semibold text-gray-900">Conversations</h2>
                    <label htmlFor="chat-search" className="sr-only">Search conversations</label>
                    <div className="relative">
                        <HiOutlineMagnifyingGlass aria-hidden="true" className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <input id="chat-search" type="search" maxLength={100} value={search} onChange={(event) => {
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
                                {value === "all" ? `All (${counts.all})` : `Unread (${counts.unread})`}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-2">
                    {connection.connectionError && <p role="status" className="m-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{connection.connectionError}</p>}
                    {loadingInbox && conversations.length === 0 && <p role="status" className="px-4 py-12 text-center text-sm text-gray-500">Loading conversations...</p>}
                    {inboxError && connection.connected && <p role="status" className="m-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">{inboxError} <button type="button" onClick={() => setRefresh((value) => value + 1)} className="font-medium underline">Retry</button></p>}
                    {conversations.map((conversation) => {
                        const lastMessage = conversation.messages.at(-1);
                        return (
                            <button key={conversation.id} type="button" aria-pressed={selectedId === conversation.id} onClick={() => handleSelect(conversation)} className={`mb-1 flex w-full items-start gap-3 rounded-xl p-3 text-left transition ${selectedId === conversation.id ? "bg-gray-100" : "hover:bg-gray-50"}`}>
                                <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-semibold text-gray-700">{conversation.name.charAt(0)}</span>
                                <span className="min-w-0 flex-1">
                                    <span className="flex items-center justify-between gap-2">
                                        <span className="truncate text-sm font-semibold text-gray-900">{conversation.name}</span>
                                        <span className="shrink-0 text-[10px] text-gray-400">{lastMessage?.time}</span>
                                    </span>
                                    <span className="mt-1 flex items-center gap-2">
                                        <span className="min-w-0 flex-1 truncate text-xs text-gray-500">{lastMessage?.sender === "admin" ? "You: " : lastMessage?.sender === "bot" ? "AI: " : ""}{lastMessage?.text || "No messages yet"}</span>
                                        {conversation.unread > 0 && <span aria-label={`${conversation.unread} unread messages`} className="flex h-5 min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-semibold text-white">{conversation.unread}</span>}
                                    </span>
                                </span>
                            </button>
                        );
                    })}
                    {!loadingInbox && pagination.total === 0 && (
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
                    <ChatWindow key={activeConversation.id} title={activeConversation.name} subtitle={activeConversation.email} messages={messages} sender="admin" draft={drafts[activeConversation.id] || ""} onDraftChange={(value) => setDrafts((previous) => ({ ...previous, [activeConversation.id]: value }))} onSend={handleSend} onBack={() => setActiveConversation(null)}
                        connected={connection.connected} canSend={!connection.requiresLogin} requiresLogin={connection.requiresLogin} status={connection.connected ? "Live updates" : "Live chat"} online={connection.connected} sending={connection.sending} loading={history.loading && messages.length === 0}
                        onRetryMessage={connection.retryMessage}
                        assistantThinking={connection.assistantThinking.includes(activeConversation.id)}
                        error={sendError || (connection.connected ? history.error : "") || connection.connectionError} onReconnect={() => { connection.reconnect(); setRefresh((value) => value + 1); }} hasMore={history.history.hasMore} loadingOlder={history.loadingOlder} onLoadOlder={history.loadOlder} />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center bg-gray-50 px-6 text-center">
                        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 text-gray-500"><HiOutlineChatBubbleLeftRight aria-hidden="true" className="h-8 w-8" /></div>
                        <h2 className="text-lg font-semibold text-gray-900">Your conversations, in one place</h2>
                        <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">Select a conversation to read messages and reply to a customer.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
