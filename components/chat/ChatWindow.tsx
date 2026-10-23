"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { HiOutlineArrowLeft, HiOutlineChatBubbleLeftRight, HiOutlinePaperAirplane } from "react-icons/hi2";
import type { ChatMessage } from "@/types/chat";

type ChatWindowProps = {
    title: string;
    subtitle: string;
    messages: ChatMessage[];
    sender: "user" | "admin";
    draft: string;
    onDraftChange: (value: string) => void;
    onSend: (text: string) => Promise<void>;
    connected: boolean;
    canSend?: boolean;
    requiresLogin?: boolean;
    onRetryMessage?: (id: string) => void;
    status: string;
    online: boolean;
    sending: boolean;
    loading: boolean;
    error?: string;
    onReconnect: () => void;
    hasMore: boolean;
    loadingOlder: boolean;
    onLoadOlder: () => Promise<void>;
    onBack?: () => void;
    suggestions?: string[];
    assistantThinking?: boolean;
};

export default function ChatWindow({ title, subtitle, messages, sender, draft, onDraftChange, onSend, connected, canSend = connected, requiresLogin = false, onRetryMessage, status, online, sending, loading, error, onReconnect, hasMore, loadingOlder, onLoadOlder, onBack, suggestions = [], assistantThinking = false }: ChatWindowProps) {
    const messagesRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const scrollRef = useRef({ lastId: "", height: 0 });
    const submittingRef = useRef(false);

    useEffect(() => {
        const container = messagesRef.current;
        if (container) {
            const lastId = messages.at(-1)?.id || "";
            if (lastId && scrollRef.current.lastId === lastId) container.scrollTop += container.scrollHeight - scrollRef.current.height;
            else container.scrollTop = container.scrollHeight;
            scrollRef.current = { lastId, height: container.scrollHeight };
        }
    }, [messages, assistantThinking]);

    const sendMessage = async () => {
        const text = draft.trim();
        if (!text || text.length > 2000 || !canSend || submittingRef.current || sending || loading) return;
        submittingRef.current = true;

        try {
            await onSend(text);
            onDraftChange("");
            inputRef.current?.focus();
        } catch {
            // Keep the draft if it could not be added to the local queue.
        } finally {
            submittingRef.current = false;
        }
    };

    return (
        <section aria-label={`Conversation with ${title}`} className="relative flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-white">
            <div className="flex shrink-0 items-center gap-3 border-b border-gray-200 px-4 py-4 sm:px-6">
                {onBack && (
                    <button type="button" onClick={onBack} aria-label="Back to conversations" className="shrink-0 rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden">
                        <HiOutlineArrowLeft className="h-5 w-5" />
                    </button>
                )}
                <div aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-900 text-sm font-semibold text-white">
                    {title.trim().charAt(0).toUpperCase() || "S"}
                </div>
                <div className="min-w-0 flex-1">
                    <h2 className="truncate font-semibold text-gray-900">{title}</h2>
                    <p className="mt-0.5 truncate text-xs text-gray-500">{subtitle}</p>
                </div>
                <span className="flex shrink-0 items-center gap-1.5 text-xs text-gray-500">
                    <span aria-hidden="true" className={`h-2 w-2 rounded-full ${online ? "bg-green-500" : "bg-gray-300"}`} />
                    {status}
                </span>
            </div>

            <div ref={messagesRef} role="log" aria-label="Conversation messages" aria-live="polite" aria-relevant="additions text" className={`relative min-h-0 flex-1 overflow-y-auto overscroll-contain bg-gray-50 px-4 py-6 sm:px-6 ${messages.length === 0 ? "flex flex-col" : "space-y-4"}`}>
                {hasMore && <button type="button" onClick={() => { void onLoadOlder(); }} disabled={loadingOlder} className="mx-auto block rounded-full border border-gray-200 bg-white px-4 py-2 text-xs text-gray-600 transition hover:border-gray-400 disabled:opacity-50">{loadingOlder ? "Loading..." : "Load older messages"}</button>}
                {loading && messages.length === 0 ? (
                    <p role="status" className="m-auto py-12 text-center text-sm text-gray-500">Loading messages...</p>
                ) : messages.length === 0 ? (
                    <div className="m-auto flex shrink-0 flex-col items-center justify-center text-center">
                        <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 text-gray-500">
                            <HiOutlineChatBubbleLeftRight aria-hidden="true" className="h-8 w-8" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">How can we help?</h3>
                        <p className="mt-2 max-w-xs text-sm leading-6 text-gray-500">Ask about your order, a product, or a return.</p>
                        {suggestions.length > 0 && (
                            <div className="mt-5 flex max-w-sm flex-wrap justify-center gap-2">
                                {suggestions.map((suggestion) => (
                                    <button key={suggestion} type="button" onClick={() => {
                                        onDraftChange(suggestion);
                                        inputRef.current?.focus();
                                    }} className="rounded-full border border-gray-200 bg-white px-3 py-2 text-xs text-gray-600 transition hover:border-gray-400 hover:text-black">
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                ) : messages.map((message) => {
                    const ownMessage = message.sender === sender;

                    return (
                        <div key={message.id} className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}>
                            <div className="max-w-[85%] sm:max-w-[75%]">
                                <span className={message.sender === "bot" ? "mb-1.5 block text-xs font-medium text-gray-500" : "sr-only"}>{message.sender === "bot" ? "AI assistant" : ownMessage ? "You" : title}: </span>
                                <p className={`whitespace-pre-wrap wrap-break-word rounded-2xl px-4 py-3 text-sm leading-6 ${ownMessage ? "rounded-br-sm bg-gray-900 text-white" : "rounded-bl-sm border border-gray-200 bg-white text-gray-700"}`}>
                                    {message.text}
                                </p>
                                <div className={`mt-1.5 flex items-center gap-2 text-xs text-gray-400 ${ownMessage ? "justify-end" : "justify-start"}`}>
                                    <time dateTime={message.createdAt}>{message.time}</time>
                                    {ownMessage && <span>{message.delivery === "queued" ? "Waiting to send" : message.delivery === "sending" ? "Sending…" : message.delivery === "failed" ? "Not sent" : "Sent"}</span>}
                                    {ownMessage && message.delivery === "failed" && message.clientMessageId && onRetryMessage && <button type="button" title={message.deliveryError} onClick={() => onRetryMessage(message.clientMessageId!)} className="font-medium text-gray-600 underline underline-offset-2">Retry</button>}
                                </div>
                            </div>
                        </div>
                    );
                })}
                {assistantThinking && <p role="status" className="mt-4 text-xs text-gray-500">AI assistant is replying...</p>}
            </div>

            <form onSubmit={(event) => { event.preventDefault(); void sendMessage(); }} className="shrink-0 border-t border-gray-200 bg-white p-4 sm:px-6">
                {error && <div role="status" className="mb-3 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-600">
                    <p>{error}</p>
                    {requiresLogin ? <Link href={`/auth/login?next=${encodeURIComponent(sender === "admin" ? "/admin/chats" : "/chat")}`} className="mt-1 inline-block font-medium underline">Sign in</Link>
                        : <button type="button" onClick={onReconnect} className="mt-1 font-medium underline">Try again</button>}
                </div>}
                <label htmlFor="chat-message" className="sr-only">Your message</label>
                <div className="flex items-end gap-3 rounded-xl border border-gray-300 bg-white p-2 focus-within:border-black focus-within:ring-1 focus-within:ring-black">
                    <textarea ref={inputRef} id="chat-message" value={draft} onChange={(event) => onDraftChange(event.target.value)} onKeyDown={(event) => {
                        if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
                            event.preventDefault();
                            void sendMessage();
                        }
                    }} disabled={sending} maxLength={2000} rows={2} placeholder="Write your message..." className="max-h-36 min-h-11 min-w-0 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400" />
                    <button type="submit" disabled={!draft.trim() || draft.trim().length > 2000 || !canSend || sending || loading} aria-label={sending ? "Sending message" : "Send message"} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-black text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-200 disabled:text-gray-400">
                        <HiOutlinePaperAirplane aria-hidden="true" className="h-5 w-5" />
                    </button>
                </div>
                <div className="mt-2 flex justify-between gap-3 text-xs text-gray-400">
                    <p>Enter to send, Shift+Enter for a new line</p>
                    <span aria-label={`${draft.length} of 2000 characters`}>{draft.length}/2000</span>
                </div>
            </form>
        </section>
    );
}
