"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { apiRequest } from "@/lib/api";
import NotificationBell from "@/components/notifications/NotificationBell";
import type { NotificationFilter, NotificationPage } from "@/types/notification";

let connectionGeneration = 0;

export default function LiveNotificationBell() {
    const { user } = useAuth();
    return user ? <ConnectedBell key={user.id} userId={user.id} /> : <NotificationBell />;
}

function ConnectedBell({ userId }: { userId: string }) {
    const { refreshUser } = useAuth();
    const [page, setPage] = useState<NotificationPage | null>(null);
    const [filter, setFilter] = useState<NotificationFilter>("all");
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState("");
    const [liveError, setLiveError] = useState("");
    const [connection, setConnection] = useState(0);
    const alive = useRef(true);
    const requestVersion = useRef({ value: 0 });

    const refresh = useCallback(async (cursor?: string) => {
        const version = ++requestVersion.current.value;
        try {
            if (cursor) setLoadingMore(true);
            const result = await apiRequest<{ data: NotificationPage }>(`/api/notifications?filter=${filter}${cursor ? `&cursor=${encodeURIComponent(cursor)}` : ""}`, { cache: "no-store", signal: AbortSignal.timeout(20000) });
            if (!alive.current || version !== requestVersion.current.value) return;
            setPage((previous) => cursor && previous ? { ...result.data, items: [...previous.items, ...result.data.items.filter((item) => !previous.items.some((existing) => existing.id === item.id))] } : result.data);
            setError("");
        } catch {
            if (!alive.current || version !== requestVersion.current.value) return;
            setError("Your notifications couldn't be refreshed.");
            await refreshUser();
        } finally {
            if (alive.current && version === requestVersion.current.value) { setLoading(false); setLoadingMore(false); }
        }
    }, [filter, refreshUser]);

    useEffect(() => {
        alive.current = true;
        const requests = requestVersion.current;
        const initial = setTimeout(() => { void refresh(); }, 0);
        const poll = setInterval(() => { void refresh(); }, 60000);
        const focus = () => { void refresh(); };
        window.addEventListener("focus", focus);
        window.addEventListener("online", focus);
        return () => { alive.current = false; requests.value++; clearTimeout(initial); clearInterval(poll); window.removeEventListener("focus", focus); window.removeEventListener("online", focus); };
    }, [refresh]);

    useEffect(() => {
        if (!page?.nextExpiry) return;
        const timer = setTimeout(() => { void refresh(); }, Math.max(100, Math.min(new Date(page.nextExpiry).getTime() - Date.now() + 100, 2147483647)));
        return () => clearTimeout(timer);
    }, [page?.nextExpiry, refresh]);

    useEffect(() => {
        const generation = ++connectionGeneration;
        let canceled = false;
        let disconnect: (() => Promise<void>) | undefined;
        let unsubscribe: (() => void) | undefined;
        let refreshTimer: ReturnType<typeof setTimeout>;
        let connectedAt = 0;
        let failed = false;
        const resume = () => { if (failed || (connectedAt && Date.now() - connectedAt > 30 * 60000)) setConnection((value) => value + 1); };
        window.addEventListener("focus", resume);
        window.addEventListener("online", resume);
        const connect = async () => {
            try {
                const result = await apiRequest<{ data: { customToken: string; expiresAt: string } }>("/api/notifications", { method: "POST", body: JSON.stringify({ action: "connect" }), signal: AbortSignal.timeout(20000) });
                const [{ notificationClient }, { signInWithCustomToken, signOut }, { doc, onSnapshot }] = await Promise.all([
                    import("@/lib/firebase-client"), import("firebase/auth"), import("firebase/firestore"),
                ]);
                const client = await notificationClient();
                if (canceled || generation !== connectionGeneration) return;
                disconnect = () => signOut(client.auth);
                await signInWithCustomToken(client.auth, result.data.customToken);
                if (canceled || generation !== connectionGeneration) return;
                connectedAt = Date.now();
                unsubscribe = onSnapshot(doc(client.db, "notificationInboxes", userId), () => { setLiveError(""); void refresh(); }, () => {
                    failed = true;
                    if (!canceled) setLiveError("Live updates are temporarily unavailable. You can still refresh your inbox.");
                });
                refreshTimer = setTimeout(() => setConnection((value) => value + 1), 40 * 60000);
            } catch {
                failed = true;
                if (!canceled) setLiveError("Live updates are temporarily unavailable. You can still refresh your inbox.");
            }
        };
        void connect();
        return () => {
            canceled = true;
            unsubscribe?.();
            clearTimeout(refreshTimer);
            window.removeEventListener("focus", resume);
            window.removeEventListener("online", resume);
            if (generation === connectionGeneration) { connectionGeneration++; if (disconnect) void disconnect().catch(() => {}); }
        };
    }, [userId, connection, refresh]);

    const markRead = async (id?: string) => {
        try {
            await apiRequest("/api/notifications", { method: "POST", body: JSON.stringify(id ? { action: "read", id } : { action: "read-all" }), keepalive: true, signal: AbortSignal.timeout(20000) });
            await refresh();
        } catch { if (alive.current) setError("The read status couldn't be saved. Please try again."); }
    };

    return <NotificationBell items={page?.items} unreadCount={page?.unreadCount} loading={loading} loadingMore={loadingMore} error={error || liveError}
        filter={filter} retentionDays={page?.retentionDays} hasMore={Boolean(page?.nextCursor)} onFilterChange={setFilter}
        onLoadMore={() => { if (page?.nextCursor) void refresh(page.nextCursor); }} onRead={markRead} onReadAll={() => markRead()}
        onRetry={() => { void refresh(); setConnection((value) => value + 1); }} />;
}
