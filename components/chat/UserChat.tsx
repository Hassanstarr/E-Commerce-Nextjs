"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import { useAuth } from "@/context/AuthContext";
import useChatConnection from "@/hooks/useChatConnection";
import useChatHistory from "@/hooks/useChatHistory";
import { getMyChat } from "@/services/chat.api";
import { mergeChatMessages } from "@/lib/chat-messages";

export default function UserChat() {
    const { user } = useAuth();
    const connection = useChatConnection(Boolean(user) && user?.role !== "admin");
    const [conversationId, setConversationId] = useState("");
    const [draft, setDraft] = useState("");
    const [error, setError] = useState("");
    const [refresh, setRefresh] = useState(0);
    const history = useChatHistory(conversationId, connection.sync, refresh);
    const { reconcileMessages, messages: outgoingMessages } = connection;
    const messages = useMemo(() => mergeChatMessages(history.history.messages, outgoingMessages.filter((message) => message.conversationId === conversationId)), [history.history.messages, outgoingMessages, conversationId]);

    useEffect(() => { reconcileMessages(history.history.messages); }, [history.history.messages, reconcileMessages]);

    useEffect(() => {
        if (!user || user.role === "admin") return;
        let cancelled = false;
        void getMyChat().then((data) => {
            if (!cancelled) { setConversationId(data.conversationId); setError(""); }
        }).catch((loadError) => {
            if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to start chat");
        });
        return () => { cancelled = true; };
    }, [user, refresh]);

    const handleSend = async (text: string) => {
        setError("");
        try {
            await connection.sendMessage(conversationId, text);
        } catch (sendError) {
            setError(sendError instanceof Error ? sendError.message : "Unable to send your message");
            throw sendError;
        }
    };

    if (user?.role === "admin") {
        return <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center text-sm text-gray-600">Manage customer conversations in <Link href="/admin/chats" className="font-medium text-black underline">the admin chat inbox</Link>.</div>;
    }

    return (
        <div className="h-[min(640px,calc(100dvh-15rem))] min-h-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <ChatWindow title="ShopEase Support" subtitle={connection.connected && !connection.adminOnline ? connection.botAvailable ? "Our team is offline. Ask the AI about your orders, cart, wishlist or products." : "Leave a message. Our team can reply when available." : "Chat with our store team"} messages={messages} sender="user" draft={draft} onDraftChange={setDraft} onSend={handleSend}
                connected={connection.connected && Boolean(conversationId)} canSend={Boolean(conversationId) && !connection.requiresLogin} requiresLogin={connection.requiresLogin} status={connection.connected ? connection.adminOnline ? "Team online" : connection.botAvailable ? "AI available" : "Team offline" : "Live chat"} online={connection.connected && connection.adminOnline} sending={connection.sending}
                onRetryMessage={connection.retryMessage}
                assistantThinking={connection.assistantThinking.includes(conversationId)}
                loading={!conversationId && !error || history.loading && messages.length === 0} error={error || (connection.connected ? history.error : "") || connection.connectionError}
                onReconnect={() => { setRefresh((value) => value + 1); connection.reconnect(); }} hasMore={history.history.hasMore} loadingOlder={history.loadingOlder} onLoadOlder={history.loadOlder}
                suggestions={["Where is my order?", "Product question", "Help with a return"]} />
        </div>
    );
}
