import { randomUUID } from "crypto";
import WebSocket, { type RawData } from "ws";
import ChatConversation from "@/models/ChatConversation";
import ChatPresence from "@/models/ChatPresence";
import { getChatIdentity, initializeChat, sendChatMessage, isChatAdminOnline } from "@/services/chat.service";
import { rateLimiters } from "@/lib/rate-limit";
import AppError from "@/lib/AppError";
import type { ChatIdentity, ChatServerEvent } from "@/types/chat";
import { replyWhenAdminOffline } from "@/services/chat-bot.service";
import { isChatBotAvailable } from "@/services/gemini.service";
import type { ChatMessageData } from "@/types/chat";

type Peer = { socket: WebSocket; token: string; identity: ChatIdentity; connectionId: string };

export function createChatRuntime(options: {
    messageLimit?: (userId: string) => Promise<{ success: boolean }>;
    assistantReply?: (message: ChatMessageData) => Promise<ChatMessageData | null>;
} = {}) {
    const peers = new Set<Peer>();
    const assistantJobs = new Set<Promise<void>>();
    const thinking = new Map<string, number>();
    let stopping = false;
    let watcher: ReturnType<typeof ChatConversation.collection.watch> | null = null;
    let starting: Promise<void> | null = null;
    let connecting = 0;
    let idleTimer: ReturnType<typeof setTimeout> | undefined;

    const stopWhenIdle = () => {
        if (idleTimer) clearTimeout(idleTimer);
        idleTimer = setTimeout(() => {
            if (peers.size === 0 && connecting === 0 && assistantJobs.size === 0) {
                const stream = watcher;
                watcher = null;
                starting = null;
                void stream?.close();
            }
        }, 5000);
        idleTimer.unref();
    };

    const send = (socket: WebSocket, event: ChatServerEvent) => {
        if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify(event));
    };

    const verifyPeer = async (peer: Peer) => {
        const identity = await getChatIdentity(peer.token);
        if (identity.role !== peer.identity.role) throw new AppError("Your access changed. Please reconnect.", 401);
        return identity;
    };

    const notify = async (conversationId: string, userId: string, event: ChatServerEvent = { type: "changed", conversationId }) => {
        await Promise.allSettled([...peers].map(async (peer) => {
            try {
                const identity = await verifyPeer(peer);
                if (identity.role === "admin" || identity.userId === userId) {
                    send(peer.socket, event);
                }
            } catch (error) {
                peer.socket.close(error instanceof AppError && error.statusCode === 401 ? 4401 : 1012, "Please reconnect");
            }
        }));
    };

    const startAssistant = (message: ChatMessageData, userId: string) => {
        if (stopping) return;
        const id = message.conversationId;
        thinking.set(id, (thinking.get(id) || 0) + 1);
        const job = (async () => {
            if (await isChatAdminOnline()) return;
            await notify(id, userId, { type: "assistant", conversationId: id, thinking: true });
            await (options.assistantReply || replyWhenAdminOffline)(message);
        })().catch((error) => {
            console.error("AI chat task failed:", error instanceof Error ? error.message : "Unknown error");
        }).finally(async () => {
            assistantJobs.delete(job);
            const remaining = (thinking.get(id) || 1) - 1;
            if (remaining) thinking.set(id, remaining);
            else {
                thinking.delete(id);
                await notify(id, userId, { type: "assistant", conversationId: id, thinking: false });
            }
            if (peers.size === 0) stopWhenIdle();
        });
        assistantJobs.add(job);
    };

    const start = async () => {
        if (!starting) starting = (async () => {
            await initializeChat();
            const stream = ChatConversation.collection.watch([
                { $match: { operationType: { $in: ["insert", "update", "replace"] } } },
            ], { fullDocument: "updateLookup", maxAwaitTimeMS: 1000 });
            watcher = stream;
            await stream.tryNext();
            void (async () => {
                try {
                    while (watcher === stream) {
                        const change = await stream.tryNext();
                        if (change && "fullDocument" in change && change.fullDocument) {
                            void notify(change.fullDocument._id.toString(), change.fullDocument.user.toString());
                        }
                    }
                } catch (error) {
                    if (watcher !== stream) return;
                    console.error("Chat change stream interrupted:", error instanceof Error ? error.message : "Unknown error");
                    for (const peer of peers) peer.socket.close(1012, "Chat is reconnecting");
                    watcher = null;
                    starting = null;
                    await stream.close();
                }
            })();
        })().catch(async (error) => {
            const stream = watcher;
            watcher = null;
            starting = null;
            await stream?.close();
            throw error;
        });
        await starting;
    };

    const attach = async (socket: WebSocket, token: string) => {
        connecting++;
        if (idleTimer) clearTimeout(idleTimer);
        let peer: Peer | undefined;
        let heartbeat: ReturnType<typeof setInterval> | undefined;
        let closed = false;
        let queued = 0;
        let chain = Promise.resolve();
        const cleanup = () => {
            closed = true;
            if (heartbeat) clearInterval(heartbeat);
            if (peer) {
                peers.delete(peer);
                void ChatPresence.deleteOne({ _id: peer.connectionId }).catch(() => {});
            }
            stopWhenIdle();
        };
        socket.on("close", cleanup);
        socket.on("error", cleanup);

        try {
            const identity = await getChatIdentity(token);
            await start();
            if (closed || socket.readyState !== WebSocket.OPEN) return;
            peer = { socket, token, identity, connectionId: randomUUID() };
            peers.add(peer);

            const updatePresence = async () => {
                if (!peer || closed) return;
                try {
                    await verifyPeer(peer);
                    if (identity.role === "admin") {
                        await ChatPresence.updateOne({ _id: peer.connectionId }, {
                            $set: { user: identity.userId, expiresAt: new Date(Date.now() + 35000) },
                        }, { upsert: true });
                        if (closed) await ChatPresence.deleteOne({ _id: peer.connectionId });
                    }
                    send(socket, { type: "presence", adminOnline: await isChatAdminOnline(), botAvailable: isChatBotAvailable() });
                } catch (error) {
                    socket.close(error instanceof AppError && error.statusCode === 401 ? 4401 : 1012, "Please reconnect");
                }
            };
            await updatePresence();
            if (closed) return;
            send(socket, { type: "ready", adminOnline: await isChatAdminOnline(), botAvailable: isChatBotAvailable() });
            heartbeat = setInterval(() => { void updatePresence(); }, 10000);

            socket.on("message", (raw: RawData, isBinary: boolean) => {
                if (isBinary || raw.toString().length > 12000 || queued >= 10) {
                    socket.close(1008, "Too many or invalid messages");
                    return;
                }
                queued++;
                chain = chain.then(async () => {
                    if (closed || !peer) return;
                    let requestId: string | undefined;
                    try {
                        const body = JSON.parse(raw.toString());
                        if (typeof body?.requestId === "string" && body.requestId.length <= 100) requestId = body.requestId;
                        if (body?.type !== "send" || !requestId) throw new AppError("Invalid chat command", 400);
                        const currentIdentity = await verifyPeer(peer);
                        const limitMessage = options.messageLimit || ((userId: string) => rateLimiters.chatMessage.limit(userId));
                        const limit = await limitMessage(currentIdentity.userId);
                        if (!limit.success) throw new AppError("Too many messages. Please wait a minute.", 429);
                        const message = await sendChatMessage(currentIdentity, body);
                        send(socket, { type: "ack", requestId, message });
                        if (currentIdentity.role === "user" && isChatBotAvailable()) {
                            startAssistant(message, currentIdentity.userId);
                        }
                    } catch (error) {
                        send(socket, { type: "error", requestId,
                            message: error instanceof AppError ? error.message : "Unable to send message. Please try again.",
                            status: error instanceof AppError ? error.statusCode : 500 });
                        if (error instanceof AppError && error.statusCode === 401) socket.close(4401, "Session expired");
                    }
                }).finally(() => { queued--; }).catch(() => { socket.close(1011, "Unable to process chat command"); });
            });
        } catch (error) {
            console.error("Chat connection failed:", error instanceof Error ? error.message : "Unknown error");
            send(socket, { type: "error", message: error instanceof AppError ? error.message : "Live chat is temporarily unavailable. Please try again." });
            socket.close(error instanceof AppError && error.statusCode === 401 ? 4401 : 1011, "Unable to connect");
        } finally {
            connecting--;
            if (peers.size === 0) stopWhenIdle();
        }
    };

    return {
        attach,
        async close() {
            stopping = true;
            if (idleTimer) clearTimeout(idleTimer);
            for (const peer of peers) peer.socket.close(1001, "Server stopping");
            await Promise.allSettled([...assistantJobs]);
            const stream = watcher;
            watcher = null;
            starting = null;
            await stream?.close();
        },
    };
}

declare global {
    var shopEaseChatRuntime: ReturnType<typeof createChatRuntime> | undefined;
}

export function getChatRuntime() {
    global.shopEaseChatRuntime ||= createChatRuntime();
    return global.shopEaseChatRuntime;
}
