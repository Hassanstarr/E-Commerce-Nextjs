"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { useAuth } from "@/context/AuthContext";
import { ChatOutbox } from "@/lib/chat-outbox";
import type { ChatMessageData, ChatServerEvent } from "@/types/chat";

const emptyMessages: ChatMessageData[] = [];
const emptySnapshot = () => emptyMessages;
const emptySubscribe = () => () => {};

export default function useChatConnection(enabled = true) {
    const { user } = useAuth();
    const userId = user?.id;
    const role = user ? user.role === "admin" ? "admin" : "user" : undefined;
    const [connected, setConnected] = useState(false);
    const [adminOnline, setAdminOnline] = useState(false);
    const [botAvailable, setBotAvailable] = useState(false);
    const [assistantThinking, setAssistantThinking] = useState<string[]>([]);
    const [connectionError, setConnectionError] = useState("");
    const [requiresLogin, setRequiresLogin] = useState(false);
    const [sync, setSync] = useState({ conversationId: null as string | null, revision: 0 });
    const [retry, setRetry] = useState(0);
    const socketRef = useRef<WebSocket | null>(null);
    const expiredRef = useRef(false);

    const outbox = useMemo(() => userId && role ? new ChatOutbox({
        sender: role,
        storageKey: `shopease:chat-outbox:${userId}:${role}`,
        storage: {
            getItem: (key) => window.sessionStorage.getItem(key),
            setItem: (key, value) => window.sessionStorage.setItem(key, value),
        },
        onTimeout: () => socketRef.current?.close(),
        onConfirmed: () => setSync((previous) => ({ conversationId: null, revision: previous.revision + 1 })),
        onSessionExpired: () => {
            expiredRef.current = true;
            setRequiresLogin(true);
            setConnectionError("Sign in again to send your waiting messages.");
            socketRef.current?.close();
        },
    }) : null, [userId, role]);
    const messages = useSyncExternalStore(outbox?.subscribe || emptySubscribe, outbox?.getSnapshot || emptySnapshot, emptySnapshot);
    const reconcileMessages = useCallback((history: ChatMessageData[]) => outbox?.reconcile(history), [outbox]);

    useEffect(() => {
        if (!enabled || !userId || !outbox) return;
        let cancelled = false;
        let attempts = 0;
        let lastSeen = Date.now();
        let reconnectTimer: ReturnType<typeof setTimeout> | undefined;
        let watchdog: ReturnType<typeof setTimeout> | undefined;
        expiredRef.current = false;
        outbox.restore();

        const connect = () => {
            if (cancelled || expiredRef.current || !navigator.onLine) return;
            const url = new URL("/api/chat/socket", window.location.origin);
            url.protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
            if (process.env.NODE_ENV === "development") url.port = "3001";
            const socket = new WebSocket(url);
            socketRef.current = socket;
            const watch = (delay: number) => {
                if (watchdog) clearTimeout(watchdog);
                watchdog = setTimeout(() => socket.close(), delay);
            };
            watch(20000);

            socket.onmessage = (event) => {
                if (cancelled || socket !== socketRef.current) return;
                let message: ChatServerEvent;
                try { message = JSON.parse(event.data); } catch { return; }
                lastSeen = Date.now();
                watch(45000);
                if (message.type === "ready") {
                    attempts = 0;
                    expiredRef.current = false;
                    setRequiresLogin(false);
                    setConnected(true);
                    setConnectionError("");
                    setAdminOnline(message.adminOnline);
                    setBotAvailable(message.botAvailable);
                    setSync((previous) => ({ conversationId: null, revision: previous.revision + 1 }));
                    outbox.connect((command) => {
                        if (socket.readyState !== WebSocket.OPEN) throw new Error("Waiting for connection");
                        socket.send(JSON.stringify(command));
                    });
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
                } else if (message.type === "ack") {
                    outbox.acknowledge(message.requestId, message.message);
                } else if (message.type === "error") {
                    if (message.requestId) outbox.reject(message.requestId, message.status || 500, message.message);
                    if (message.status === 401) {
                        expiredRef.current = true;
                        setRequiresLogin(true);
                        setConnectionError("Sign in again to send your waiting messages.");
                        outbox.disconnect();
                        socket.close();
                    }
                }
            };
            socket.onclose = (event) => {
                if (cancelled || socket !== socketRef.current) return;
                if (watchdog) clearTimeout(watchdog);
                outbox.disconnect();
                setConnected(false);
                setAdminOnline(false);
                setBotAvailable(false);
                setAssistantThinking([]);
                if (event.code === 4401 || expiredRef.current) {
                    expiredRef.current = true;
                    setRequiresLogin(true);
                    setConnectionError("Sign in again to send your waiting messages.");
                    return;
                }
                attempts++;
                reconnectTimer = setTimeout(connect, Math.min(1000 * 2 ** Math.min(attempts - 1, 5), 30000));
            };
            socket.onerror = () => { /* onclose reconnects without discarding queued messages. */ };
        };

        const handleOnline = () => {
            if (expiredRef.current) return;
            if (!socketRef.current || socketRef.current.readyState === WebSocket.CLOSED) {
                if (reconnectTimer) clearTimeout(reconnectTimer);
                attempts = 0;
                connect();
            } else if (Date.now() - lastSeen > 45000) socketRef.current.close();
        };
        const handleVisible = () => { if (document.visibilityState === "visible") handleOnline(); };
        connect();
        window.addEventListener("online", handleOnline);
        document.addEventListener("visibilitychange", handleVisible);
        return () => {
            cancelled = true;
            window.removeEventListener("online", handleOnline);
            document.removeEventListener("visibilitychange", handleVisible);
            if (reconnectTimer) clearTimeout(reconnectTimer);
            if (watchdog) clearTimeout(watchdog);
            socketRef.current?.close();
            outbox.dispose();
        };
    }, [enabled, userId, outbox, retry]);

    const sendMessage = async (conversationId: string, text: string) => {
        if (!outbox || !enabled || expiredRef.current) throw new Error("Sign in to send a message.");
        return outbox.enqueue(conversationId, text);
    };

    return { connected, adminOnline, botAvailable, assistantThinking, connectionError, requiresLogin, sending: false,
        messages, sync, sendMessage, reconcileMessages, retryMessage: (id: string) => outbox?.retry(id), reconnect: () => setRetry((value) => value + 1) };
}
