"use client";

import { useEffect, useRef, useState } from "react";
import { getChatHistory, readChat } from "@/services/chat.api";
import { mergeChatMessages } from "@/lib/chat-messages";
import type { ChatHistory, ChatMessage, ChatMessageData } from "@/types/chat";

type HistoryState = { conversationId: string; messages: ChatMessage[]; hasMore: boolean; nextBefore: number | null };
const emptyHistory = (id: string): HistoryState => ({ conversationId: id, messages: [], hasMore: false, nextBefore: null });

function updateHistory(current: HistoryState, incoming: ChatHistory, older = false): HistoryState {
    const gap = current.messages.length > 0 && incoming.messages.length > 0
        && incoming.messages[0].sequence > current.messages[current.messages.length - 1].sequence + 1;
    if (current.conversationId !== incoming.conversationId || current.messages.length === 0 || gap) {
        return { ...incoming, messages: mergeChatMessages([], incoming.messages) };
    }
    return {
        ...current,
        messages: mergeChatMessages(current.messages, incoming.messages),
        ...(older || (incoming.messages[0] && current.messages[0].sequence >= incoming.messages[0].sequence)
            ? { hasMore: incoming.hasMore, nextBefore: incoming.nextBefore } : {}),
    };
}

export default function useChatHistory(id: string, sync: { revision: number; conversationId: string | null }, refresh: number) {
    const [history, setHistory] = useState<HistoryState>(() => emptyHistory(""));
    const [loading, setLoading] = useState(false);
    const [loadingOlder, setLoadingOlder] = useState(false);
    const [error, setError] = useState("");
    const [visibleRefresh, setVisibleRefresh] = useState(0);
    const readRef = useRef(new Map<string, number>());
    const selectedRef = useRef(id);
    useEffect(() => { selectedRef.current = id; }, [id]);

    useEffect(() => {
        const onVisible = () => {
            if (document.visibilityState === "visible") setVisibleRefresh((value) => value + 1);
        };
        document.addEventListener("visibilitychange", onVisible);
        return () => document.removeEventListener("visibilitychange", onVisible);
    }, []);

    useEffect(() => {
        if (!id) return;
        let cancelled = false;
        const timer = setTimeout(() => {
            void (async () => {
                setLoading(true);
                setError("");
                try {
                    const incoming = await getChatHistory(id);
                    if (cancelled) return;
                    setHistory((previous) => updateHistory(previous, incoming));
                    const lastSequence = incoming.messages.at(-1)?.sequence || 0;
                    if (document.visibilityState === "visible" && lastSequence > (readRef.current.get(id) || 0)) {
                        readRef.current.set(id, lastSequence);
                        try { await readChat(id, lastSequence); }
                        catch (readError) { readRef.current.delete(id); throw readError; }
                    }
                } catch (loadError) {
                    if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Unable to load messages");
                } finally {
                    if (!cancelled) setLoading(false);
                }
            })();
        }, 150);
        return () => { cancelled = true; clearTimeout(timer); };
    }, [id, sync.revision, refresh, visibleRefresh]);

    const loadOlder = async () => {
        if (!id || history.conversationId !== id || !history.nextBefore || loadingOlder) return;
        setLoadingOlder(true);
        setError("");
        try {
            const incoming = await getChatHistory(id, history.nextBefore);
            if (selectedRef.current === id) setHistory((previous) => updateHistory(previous, incoming, true));
        } catch (loadError) {
            if (selectedRef.current === id) setError(loadError instanceof Error ? loadError.message : "Unable to load older messages");
        } finally {
            setLoadingOlder(false);
        }
    };

    return {
        history: history.conversationId === id ? history : emptyHistory(id),
        loading: Boolean(id) && (loading || history.conversationId !== id),
        loadingOlder, error, loadOlder,
        addMessage(message: ChatMessageData) {
            if (selectedRef.current !== message.conversationId) return;
            setHistory((previous) => ({
                ...(previous.conversationId === message.conversationId ? previous : emptyHistory(message.conversationId)),
                messages: mergeChatMessages(previous.conversationId === message.conversationId ? previous.messages : [], [message]),
            }));
        },
    };
}
