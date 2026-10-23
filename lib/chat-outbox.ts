import type { ChatMessageData } from "@/types/chat";

type QueuedMessage = ChatMessageData & { clientMessageId: string };
type ChatCommand = { type: "send"; requestId: string; conversationId: string; clientMessageId: string; text: string };
type Storage = { getItem(key: string): string | null; setItem(key: string, value: string): void };

export class ChatOutbox {
    private messages: QueuedMessage[] = [];
    private listeners = new Set<() => void>();
    private transport: ((command: ChatCommand) => void) | null = null;
    private active: { requestId: string; id: string; timer: ReturnType<typeof setTimeout> } | null = null;
    private retryTimer: ReturnType<typeof setTimeout> | null = null;
    private failures = 0;

    constructor(private options: {
        sender: "user" | "admin";
        storage?: Storage;
        storageKey: string;
        onTimeout: () => void;
        onConfirmed: () => void;
        onSessionExpired: () => void;
        createId?: () => string;
        schedule?: typeof setTimeout;
        cancel?: typeof clearTimeout;
    }) {}

    getSnapshot = () => this.messages;
    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => { this.listeners.delete(listener); };
    };

    private publish() {
        try {
            this.options.storage?.setItem(this.options.storageKey, JSON.stringify(this.messages.filter((message) => message.delivery)));
        } catch { /* Keep messages in memory if browser storage is unavailable. */ }
        for (const listener of this.listeners) listener();
    }

    restore() {
        if (this.messages.length) return;
        try {
            const stored: unknown = JSON.parse(this.options.storage?.getItem(this.options.storageKey) || "[]");
            if (!Array.isArray(stored)) return;
            const ids = new Set<string>();
            this.messages = stored.slice(0, 100).flatMap((item) => {
                if (!item || typeof item !== "object" || typeof item.clientMessageId !== "string"
                    || !/^[a-f\d-]{36}$/i.test(item.clientMessageId) || ids.has(item.clientMessageId)
                    || typeof item.conversationId !== "string" || !/^[a-f\d]{24}$/i.test(item.conversationId)
                    || item.sender !== this.options.sender || typeof item.text !== "string" || !item.text.trim() || item.text.length > 2000
                    || typeof item.createdAt !== "string" || !Number.isFinite(Date.parse(item.createdAt))) return [];
                ids.add(item.clientMessageId);
                return [{ id: `local-${item.clientMessageId}`, clientMessageId: item.clientMessageId, conversationId: item.conversationId,
                    sequence: Number.MAX_SAFE_INTEGER, sender: this.options.sender, text: item.text, createdAt: item.createdAt,
                    delivery: item.delivery === "failed" ? "failed" as const : "queued" as const,
                    ...(item.delivery === "failed" ? { deliveryError: "Not sent. Tap to retry." } : {}),
                }];
            });
            this.publish();
        } catch { /* Ignore invalid or inaccessible browser storage. */ }
    }

    enqueue(conversationId: string, text: string) {
        const trimmed = text.trim();
        if (!/^[a-f\d]{24}$/i.test(conversationId)) throw new Error("Open a conversation before sending a message.");
        if (!trimmed || trimmed.length > 2000) throw new Error("Messages must contain between 1 and 2000 characters.");
        if (this.messages.filter((message) => message.delivery).length >= 100) throw new Error("Your message queue is full. Wait for your messages to send before adding more.");
        const id = (this.options.createId || crypto.randomUUID.bind(crypto))();
        const message: QueuedMessage = { id: `local-${id}`, clientMessageId: id, conversationId, text: trimmed,
            sequence: Number.MAX_SAFE_INTEGER, sender: this.options.sender, createdAt: new Date().toISOString(), delivery: "queued" };
        const recent = new Set(this.messages.filter((entry) => !entry.delivery).slice(-100));
        this.messages = [...this.messages.filter((entry) => entry.delivery || recent.has(entry)), message];
        this.publish();
        this.flush();
        return message;
    }

    connect(transport: (command: ChatCommand) => void) {
        this.transport = transport;
        this.flush();
    }

    disconnect() {
        this.transport = null;
        if (this.active) (this.options.cancel || clearTimeout)(this.active.timer);
        this.active = null;
        if (this.messages.some((message) => message.delivery === "sending")) {
            this.messages = this.messages.map((message) => message.delivery === "sending" ? { ...message, delivery: "queued" } : message);
            this.publish();
        }
    }

    private pause(delay: number) {
        if (this.retryTimer) return;
        this.retryTimer = (this.options.schedule || setTimeout)(() => {
            this.retryTimer = null;
            this.flush();
        }, delay);
    }

    private flush() {
        if (!this.transport || this.active || this.retryTimer) return;
        const message = this.messages.find((entry) => entry.delivery === "queued");
        if (!message) return;
        const requestId = (this.options.createId || crypto.randomUUID.bind(crypto))();
        const timer = (this.options.schedule || setTimeout)(() => {
            if (this.active?.requestId !== requestId) return;
            this.disconnect();
            this.options.onTimeout();
        }, 15000);
        this.active = { requestId, id: message.clientMessageId, timer };
        this.messages = this.messages.map((entry) => entry === message ? { ...entry, delivery: "sending" } : entry);
        this.publish();
        try {
            this.transport({ type: "send", requestId, conversationId: message.conversationId, clientMessageId: message.clientMessageId, text: message.text });
        } catch {
            this.disconnect();
            this.options.onTimeout();
        }
    }

    acknowledge(requestId: string, message: ChatMessageData) {
        if (this.active?.requestId !== requestId) return;
        const pending = this.messages.find((entry) => entry.clientMessageId === this.active?.id);
        if (!pending || message.conversationId !== pending.conversationId || message.sender !== pending.sender
            || (message.clientMessageId && message.clientMessageId !== pending.clientMessageId)) return;
        (this.options.cancel || clearTimeout)(this.active.timer);
        this.active = null;
        this.failures = 0;
        this.messages = this.messages.map((entry) => entry === pending ? { ...message, clientMessageId: pending.clientMessageId } : entry);
        this.publish();
        this.options.onConfirmed();
        this.flush();
    }

    reject(requestId: string, status: number, reason: string) {
        if (this.active?.requestId !== requestId) return;
        const id = this.active.id;
        (this.options.cancel || clearTimeout)(this.active.timer);
        this.active = null;
        const temporary = status === 401 || status === 429 || status >= 500;
        this.messages = this.messages.map((message) => message.clientMessageId === id
            ? { ...message, delivery: temporary ? "queued" : "failed", deliveryError: temporary ? undefined : reason } : message);
        if (status === 401) {
            this.transport = null;
            this.options.onSessionExpired();
        } else if (temporary) {
            this.failures++;
            this.pause(status === 429 ? 60000 : Math.min(1000 * 2 ** Math.min(this.failures - 1, 5), 30000));
        }
        this.publish();
        this.flush();
    }

    retry(id: string) {
        this.messages = this.messages.map((message) => message.clientMessageId === id && message.delivery === "failed"
            ? { ...message, delivery: "queued", deliveryError: undefined } : message);
        this.publish();
        this.flush();
    }

    reconcile(history: ChatMessageData[]) {
        const received = new Set(history.filter((message) => !message.delivery && message.sender === this.options.sender && message.clientMessageId)
            .map((message) => `${message.conversationId}:${message.clientMessageId}`));
        const confirmed = this.messages.filter((message) => received.has(`${message.conversationId}:${message.clientMessageId}`));
        if (!confirmed.length) return;
        if (this.active && confirmed.some((message) => message.clientMessageId === this.active?.id)) {
            (this.options.cancel || clearTimeout)(this.active.timer);
            this.active = null;
        }
        this.messages = this.messages.filter((message) => !confirmed.includes(message));
        this.publish();
        this.flush();
    }

    dispose() {
        this.disconnect();
        if (this.retryTimer) (this.options.cancel || clearTimeout)(this.retryTimer);
        this.retryTimer = null;
    }
}
