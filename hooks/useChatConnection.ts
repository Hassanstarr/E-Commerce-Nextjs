"use client";

import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import type { ChatMessageData, ChatServerEvent } from "@/types/chat";

type PendingMessage = {
    resolve: (message: ChatMessageData) => void;
    reject: (error: Error) => void;
    timer: ReturnType<typeof setTimeout>;
};

export default function useChatConnection(enabled = true) {
    const { user } = useAuth();
    const userId = user?.id;
    const role = user?.role;
    const [connected, setConnected] = useState(false);
    const [adminOnline, setAdminOnline] = useState(false);
    const [botAvailable, setBotAvailable] = useState(false);
    const [assistantThinking, setAssistantThinking] = useState<string[]>([]);
    const [connectionError, setConnectionError] = useState("");
    const [sending, setSending] = useState(false);
    const [sync, setSync] = useState({ conversationId: null as string | null, revision: 0 });
    const [retry, setRetry] = useState(0);
    const socketRef = useRef<WebSocket | null>(null);
    const pendingRef = useRef(new Map<string, PendingMessage>());
    const retryRef = useRef(new Map<string, { text: string; id: string }>());
    const sendingRef = useRef(false);

    useEffect(() => {
        if (!enabled || !userId) return;
        let cancelled = false;
        let attempts = 0;
        let reconnectTimer: ReturnType<typeof setTimeout> | undefined;

        const connect = () => {
            if (cancelled) return;
            const url = new URL("/api/chat/socket", window.location.origin);
            url.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            if (process.env.NODE_ENV === "development") url.port = "3001";
            const socket = new WebSocket(url);
            socketRef.current = socket;

            socket.onmessage = (event) => {
                if (cancelled || socket !== socketRef.current) return;
                let message: ChatServerEvent;
                try { message = JSON.parse(event.data); } catch { return; }
                if (message.type === "ready") {
                    attempts = 0;
                    setConnected(true);
                    setConnectionError("");
                    setAdminOnline(message.adminOnline);
                    setBotAvailable(message.botAvailable);
                    setSync((previous) => ({ conversationId: null, revision: previous.revision + 1 }));
                } else if (message.type === "presence") {
                    setAdminOnline(message.adminOnline);
                    setBotAvailable(message.botAvailable);
                    if (message.adminOnline) setAssistantThinking([]);
                } else if (message.type === "assistant") {
                    setAssistantThinking((previous) => message.thinking
                        ? [...new Set([...previous, message.conversationId])]
                        : previous.filter((id) => id !== message.conversationId));
                } else if (message.type === "changed") {
                    setSync((previous) => ({ conversationId: message.conversationId, revision: previous.revision + 1 }));
                } else if (message.type === "ack" || message.type === "error") {
                    const pending = message.requestId ? pendingRef.current.get(message.requestId) : undefined;
                    if (pending && message.requestId) {
                        clearTimeout(pending.timer);
                        pendingRef.current.delete(message.requestId);
                        if (message.type === "ack") pending.resolve(message.message);
                        else pending.reject(new Error(message.message));
                    } else if (message.type === "error") setConnectionError(message.message);
                }
            };
            socket.onclose = (event) => {
                if (cancelled || socket !== socketRef.current) return;
                setConnected(false);
                setAdminOnline(false);
                setBotAvailable(false);
                setAssistantThinking([]);
                for (const pending of pendingRef.current.values()) {
                    clearTimeout(pending.timer);
                    pending.reject(new Error("Connection interrupted. Your message may already be saved. Retry to confirm it without duplicating it."));
                }
                pendingRef.current.clear();
                if (event.code === 4401) {
                    setConnectionError("Your session has expired. Please reload and log in again.");
                    return;
                }
                attempts++;
                if (attempts > 6) {
                    setConnectionError("Unable to connect to live chat. Please try reconnecting.");
                    return;
                }
                setConnectionError("Connection interrupted. Reconnecting...");
                reconnectTimer = setTimeout(connect, Math.min(1000 * 2 ** (attempts - 1), 30000));
            };
            socket.onerror = () => { /* onclose handles reconnecting and pending messages. */ };
        };

        const handleOnline = () => {
            if (socketRef.current?.readyState === WebSocket.CLOSED) {
                if (reconnectTimer) clearTimeout(reconnectTimer);
                attempts = 0;
                connect();
            }
        };
        connect();
        window.addEventListener("online", handleOnline);
        const pending = pendingRef.current;
        return () => {
            cancelled = true;
            window.removeEventListener("online", handleOnline);
            if (reconnectTimer) clearTimeout(reconnectTimer);
            socketRef.current?.close();
            for (const message of pending.values()) {
                clearTimeout(message.timer);
                message.reject(new Error("Chat closed before the message was confirmed."));
            }
            pending.clear();
        };
    }, [enabled, userId, role, retry]);

    const sendMessage = async (conversationId: string, text: string) => {
        const socket = socketRef.current;
        if (!connected || !socket || socket.readyState !== WebSocket.OPEN) throw new Error("Reconnect before sending your message.");
        if (sendingRef.current) throw new Error("Wait for your previous message to finish sending.");
        sendingRef.current = true;
        setSending(true);
        const previous = retryRef.current.get(conversationId);
        const clientMessageId = previous?.text === text ? previous.id : crypto.randomUUID();
        retryRef.current.set(conversationId, { text, id: clientMessageId });
        const requestId = crypto.randomUUID();

        try {
            const message = await new Promise<ChatMessageData>((resolve, reject) => {
                const timer = setTimeout(() => {
                    pendingRef.current.delete(requestId);
                    reject(new Error("Message confirmation timed out. Retry to confirm it without duplicating it."));
                }, 15000);
                pendingRef.current.set(requestId, { resolve, reject, timer });
                try { socket.send(JSON.stringify({ type: "send", requestId, conversationId, clientMessageId, text })); }
                catch (error) {
                    clearTimeout(timer);
                    pendingRef.current.delete(requestId);
                    reject(error);
                }
            });
            retryRef.current.delete(conversationId);
            return message;
        } finally {
            sendingRef.current = false;
            setSending(false);
        }
    };

    return { connected, adminOnline, botAvailable, assistantThinking, connectionError, sending, sync, sendMessage, reconnect: () => setRetry((value) => value + 1) };
}
