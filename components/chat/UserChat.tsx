"use client";

import { useState } from "react";
import ChatWindow from "@/components/chat/ChatWindow";
import type { ChatMessage } from "@/types/chat";

export default function UserChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState("");

    const handleSend = (text: string) => {
        setMessages((previous) => [...previous, {
            id: crypto.randomUUID(),
            sender: "user",
            text,
            time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        }]);
    };

    return (
        <div className="h-[min(640px,calc(100dvh-15rem))] min-h-96 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <ChatWindow title="ShopEase Support" subtitle="Chat with our store team" messages={messages} sender="user" draft={draft} onDraftChange={setDraft} onSend={handleSend} suggestions={["Where is my order?", "Product question", "Help with a return"]} />
        </div>
    );
}
