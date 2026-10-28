"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HiOutlineBell, HiOutlineCheck, HiOutlineXMark, HiOutlineShoppingBag, HiOutlineSparkles, HiOutlineChatBubbleLeftRight } from "react-icons/hi2";
import { useAuth } from "@/context/AuthContext";
import type { Notification, NotificationFilter } from "@/types/notification";

export type NotificationBellProps = {
    items?: Notification[];
    unreadCount?: number;
    loading?: boolean;
    loadingMore?: boolean;
    error?: string;
    hasMore?: boolean;
    filter?: NotificationFilter;
    retentionDays?: number;
    onFilterChange?: (filter: NotificationFilter) => void;
    onLoadMore?: () => void;
    onRead?: (id: string) => void | Promise<void>;
    onReadAll?: () => void | Promise<void>;
    onRetry?: () => void;
};

export default function NotificationBell({ items = [], unreadCount = 0, loading = false, loadingMore = false, error = "", hasMore = false, filter, retentionDays = 30, onFilterChange, onLoadMore, onRead, onReadAll, onRetry }: NotificationBellProps) {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const titleId = useId();
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [open, setOpen] = useState(false);
    const [localFilter, setLocalFilter] = useState<NotificationFilter>("all");
    const selectedFilter = filter ?? localFilter;
    const notifications = user ? items.filter((item) => selectedFilter !== "unread" || !item.readAt) : [];
    const count = user ? unreadCount : 0;

    useEffect(() => {
        if (!open) return;
        const dialog = dialogRef.current;
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = "hidden";
        dialog?.showModal();
        return () => {
            document.body.style.overflow = previousOverflow;
            dialog?.close();
        };
    }, [open]);

    const selectFilter = (value: NotificationFilter) => {
        setLocalFilter(value);
        onFilterChange?.(value);
    };

    const visitNotification = (item: Notification) => {
        void Promise.resolve(onRead?.(item.id)).catch(() => {});
        setOpen(false);
        if (item.href.startsWith("/") && !item.href.startsWith("//")) router.push(item.href);
    };

    return (
        <>
            <button type="button" onClick={() => setOpen(true)} aria-label={`Notifications${count ? `, ${count} unread` : ""}`} aria-haspopup="dialog" aria-expanded={open} className="relative flex h-11 w-11 shrink-0 touch-manipulation items-center justify-center rounded-full text-gray-600 transition hover:bg-gray-100 hover:text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900">
                <HiOutlineBell aria-hidden="true" className="h-6 w-6" />
                {count > 0 && <span className="absolute right-0 top-0 flex min-w-5 items-center justify-center rounded-full bg-gray-900 px-1 text-[10px] font-semibold leading-5 text-white">{count > 99 ? "99+" : count}</span>}
            </button>
            <dialog ref={dialogRef} aria-labelledby={titleId} onClose={() => setOpen(false)} onClick={(event) => { if (event.target === event.currentTarget) setOpen(false); }} className="fixed inset-x-0 bottom-0 top-auto m-0 w-full max-w-none overflow-hidden rounded-t-2xl border border-gray-200 bg-white p-0 text-gray-900 shadow-xl backdrop:bg-black/30 sm:bottom-auto sm:left-auto sm:right-5 sm:top-20 sm:w-[420px] sm:rounded-2xl">
                <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                    <div>
                        <h2 id={titleId} className="text-lg font-semibold">Notifications</h2>
                        <p className="mt-0.5 text-xs text-gray-500">{count ? `${count} unread update${count === 1 ? "" : "s"}` : "Your latest store updates"}</p>
                    </div>
                    <button type="button" aria-label="Close notifications" onClick={() => setOpen(false)} className="flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100"><HiOutlineXMark className="h-5 w-5" /></button>
                </div>
                {user && <div className="flex items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
                    <div role="group" aria-label="Filter notifications" className="flex gap-1 rounded-lg bg-gray-100 p-1">
                        {(["all", "unread"] as const).map((value) => <button key={value} type="button" aria-pressed={selectedFilter === value} onClick={() => selectFilter(value)} className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${selectedFilter === value ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-900"}`}>{value === "all" ? "All" : "Unread"}</button>)}
                    </div>
                    <button type="button" disabled={!count || !onReadAll} onClick={() => { void Promise.resolve(onReadAll?.()).catch(() => {}); }} className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 hover:text-black disabled:cursor-default disabled:opacity-40"><HiOutlineCheck className="h-4 w-4" />Mark all as read</button>
                </div>}
                <div className="max-h-[65dvh] overflow-y-auto overscroll-contain">
                    {error && user && <div role="status" className="m-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{error}{onRetry && <button type="button" onClick={onRetry} className="ml-2 font-semibold underline">Try again</button>}</div>}
                    {(authLoading || loading) && user ? <div aria-label="Loading notifications" className="space-y-4 p-5">{[0, 1, 2].map((item) => <div key={item} className="h-16 animate-pulse rounded-lg bg-gray-100 motion-reduce:animate-none" />)}</div>
                        : !notifications.length ? <div className="flex min-h-52 flex-col items-center justify-center px-6 py-10 text-center">
                            <span className="mb-3 rounded-full bg-gray-100 p-4"><HiOutlineBell className="h-7 w-7 text-gray-400" /></span>
                            <p className="text-sm font-semibold">{user && selectedFilter === "unread" ? "You're all caught up" : "No notifications"}</p>
                            <p className="mt-2 max-w-xs text-xs leading-5 text-gray-500">{user ? error ? "Your updates will appear here when the connection is available." : "Orders, offers and account updates will appear here." : "Sign in to view your updates."}</p>
                            {!user && <Link href="/auth/login" onClick={() => setOpen(false)} className="mt-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white">Sign in</Link>}
                        </div> : <ul className="divide-y divide-gray-100">
                            {notifications.map((item) => {
                                const Icon = item.type === "discount" || item.type === "membership" ? HiOutlineSparkles : item.type === "chat" ? HiOutlineChatBubbleLeftRight : HiOutlineShoppingBag;
                                return <li key={item.id}><button type="button" onClick={() => visitNotification(item)} className={`flex w-full gap-3 px-5 py-4 text-left transition hover:bg-gray-100 ${item.readAt ? "bg-white" : "bg-gray-50"}`}>
                                    <span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.type === "membership" ? "bg-violet-100 text-violet-700" : "bg-gray-100 text-gray-600"}`}><Icon className="h-4 w-4" /></span>
                                    <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{item.title}</span><span className="mt-1 block text-xs leading-5 text-gray-500">{item.message}</span><time dateTime={item.createdAt} className="mt-2 block text-[11px] text-gray-400">{new Date(item.createdAt).toLocaleString()}</time>{item.offerExpired && <span className="mt-1 block text-[11px] text-amber-700">Offer ended</span>}</span>
                                    {!item.readAt && <span aria-label="Unread" className="mt-2 h-2 w-2 shrink-0 rounded-full bg-violet-600" />}
                                </button></li>;
                            })}
                        </ul>}
                    {user && hasMore && <div className="px-5 py-3"><button type="button" disabled={loadingMore} onClick={onLoadMore} className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50">{loadingMore ? "Loading..." : "Load more"}</button></div>}
                </div>
                <p className="border-t border-gray-100 px-5 py-3 text-center text-[11px] text-gray-400">Notifications are kept for {retentionDays} days.</p>
            </dialog>
        </>
    );
}
