"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import { useAuth } from "@/context/AuthContext";
import useChatConnection from "@/hooks/useChatConnection";
import useChatHistory from "@/hooks/useChatHistory";
import { getMyChat } from "@/services/chat.api";

export default function UserChat() {
    const { user } = useAuth();
    const connection = useChatConnection(user?.role === "user");
    const [conversationId, setConversationId] = useState("");
    const [draft, setDraft] = useState("");
    const [error, setError] = useState("");
    const [refresh, setRefresh] = useState(0);
    const history = useChatHistory(conversationId, connection.sync, refresh);

    useEffect(() => {
        if (user?.role !== "user") return;
        let cancelled = false;
        void getMyChat().then((data) => {
            if (!cancelled) { setConversationId(data.conversationId); setError(""); }
        }).catch((loadError) => {
            if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to start chat");
        });
        return () => { cancelled = true; };
    }, [user?.id, user?.role, refresh]);

    const handleSend = async (text: string) => {
        setError("");
        try {
            const message = await connection.sendMessage(conversationId, text);
            history.addMessage(message);
            setRefresh((value) => value + 1);
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
            <ChatWindow title="ShopEase Support" subtitle={connection.connected && !connection.adminOnline ? connection.botAvailable ? "Our team is offline. Ask the AI about your orders, cart, wishlist or products." : "Leave a message. Our team can reply when available." : "Chat with our store team"} messages={history.history.messages} sender="user" draft={draft} onDraftChange={setDraft} onSend={handleSend}
                connected={connection.connected && Boolean(conversationId)} status={connection.connected ? connection.adminOnline ? "Team online" : connection.botAvailable ? "AI available" : "Team offline" : "Connecting..."} online={connection.connected && connection.adminOnline} sending={connection.sending}
                assistantThinking={connection.assistantThinking.includes(conversationId)}
                loading={!conversationId && !error || history.loading && history.history.messages.length === 0} error={error || history.error || connection.connectionError}
                onReconnect={() => { setRefresh((value) => value + 1); connection.reconnect(); }} hasMore={history.history.hasMore} loadingOlder={history.loadingOlder} onLoadOlder={history.loadOlder}
                suggestions={["Where is my order?", "Product question", "Help with a return"]} />
        </div>
    );
}
