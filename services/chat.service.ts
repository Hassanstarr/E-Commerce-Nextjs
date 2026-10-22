import mongoose from "mongoose";
import User from "@/models/User";
import ChatConversation from "@/models/ChatConversation";
import ChatMessage from "@/models/ChatMessage";
import ChatPresence from "@/models/ChatPresence";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import AppError from "@/lib/AppError";
import { chatIdSchema, chatSendSchema } from "@/lib/chat-validation";
import type { ChatIdentity, ChatMessageData, ChatConversation as ChatConversationData } from "@/types/chat";

export async function getChatIdentity(token: string): Promise<ChatIdentity> {
    const payload = await verifyToken(token);
    if (!payload || !mongoose.Types.ObjectId.isValid(payload.userId)) {
        throw new AppError("Your session has expired. Please log in again.", 401);
    }

    await connectDB();
    const user = await User.findById(payload.userId).select("role sessionVersion");
    if (!user || (user.sessionVersion || 0) !== payload.sessionVersion) {
        throw new AppError("Your session has expired. Please log in again.", 401);
    }

    return { userId: user._id.toString(), role: user.role };
}

export async function initializeChat() {
    await connectDB();
    await Promise.all([ChatConversation.init(), ChatMessage.init(), ChatPresence.init()]);
}

export async function getMyConversation(identity: ChatIdentity) {
    if (identity.role !== "user") throw new AppError("Use the admin chat inbox to reply to customers.", 403);
    const existing = await ChatConversation.findOne({ user: identity.userId });
    if (existing) return existing;

    try {
        return await ChatConversation.findOneAndUpdate(
            { user: identity.userId },
            { $setOnInsert: { user: identity.userId } },
            { upsert: true, returnDocument: "after", setDefaultsOnInsert: true }
        );
    } catch (error) {
        if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
            return await ChatConversation.findOne({ user: identity.userId });
        }
        throw error;
    }
}

async function getAuthorizedConversation(identity: ChatIdentity, id: string) {
    if (!chatIdSchema.safeParse(id).success) throw new AppError("Invalid conversation ID", 400);
    const conversation = await ChatConversation.findOne({
        _id: id,
        ...(identity.role === "user" ? { user: identity.userId } : {}),
    });
    if (!conversation) throw new AppError("Conversation not found", 404);
    return conversation;
}

export function serializeChatMessage(message: {
    _id: { toString(): string };
    conversation: { toString(): string };
    sequence: number;
    sender: "user" | "admin" | "bot";
    text: string;
    createdAt: Date;
}): ChatMessageData {
    return {
        id: message._id.toString(),
        conversationId: message.conversation.toString(),
        sequence: message.sequence,
        sender: message.sender,
        text: message.text,
        createdAt: message.createdAt.toISOString(),
    };
}

export async function getChatMessages(identity: ChatIdentity, id: string, before?: number) {
    const conversation = await getAuthorizedConversation(identity, id);
    const messages = await ChatMessage.find({
        conversation: id,
        ...(before ? { sequence: { $lt: before } } : {}),
    }).sort({ sequence: -1 }).limit(51);
    const hasMore = messages.length > 50;
    const page = messages.slice(0, 50).reverse().map(serializeChatMessage);

    return {
        conversationId: id,
        messages: page,
        hasMore,
        nextBefore: hasMore ? page[0].sequence : null,
        sequence: conversation.sequence,
    };
}

export async function sendChatMessage(identity: ChatIdentity, input: unknown) {
    const validation = chatSendSchema.safeParse(input);
    if (!validation.success) throw new AppError(validation.error.issues[0].message, 400);
    const { conversationId, clientMessageId, text } = validation.data;
    await getAuthorizedConversation(identity, conversationId);

    const findExisting = async () => {
        const existing = await ChatMessage.findOne({ senderId: identity.userId, clientMessageId });
        if (existing && (existing.conversation.toString() !== conversationId || existing.text !== text)) {
            throw new AppError("This message ID was already used. Please send a new message.", 409);
        }
        return existing;
    };
    const existing = await findExisting();
    if (existing) return serializeChatMessage(existing);

    const session = await mongoose.startSession();
    let saved: ChatMessageData | undefined;
    try {
        await session.withTransaction(async () => {
            const conversation = await ChatConversation.findOneAndUpdate(
                { _id: conversationId, ...(identity.role === "user" ? { user: identity.userId } : {}) },
                {
                    $inc: { sequence: 1, [identity.role === "user" ? "unreadAdmin" : "unreadUser"]: 1 },
                    $set: { lastMessage: text, lastSender: identity.role, lastMessageAt: new Date() },
                },
                { returnDocument: "after", session }
            );
            if (!conversation) throw new AppError("Conversation not found", 404);
            const [message] = await ChatMessage.create([{
                conversation: conversationId,
                senderId: identity.userId,
                sender: identity.role,
                clientMessageId,
                sequence: conversation.sequence,
                text,
            }], { session });
            saved = serializeChatMessage(message);
        });
    } catch (error) {
        if (error instanceof mongoose.mongo.MongoServerError && error.code === 11000) {
            const duplicate = await findExisting();
            if (duplicate) return serializeChatMessage(duplicate);
        }
        throw error;
    } finally {
        await session.endSession();
    }
    if (!saved) throw new AppError("Unable to save message. Please try again.", 500);
    return saved;
}

export async function markChatRead(identity: ChatIdentity, id: string, sequence: number) {
    await getAuthorizedConversation(identity, id);
    const readField = identity.role === "user" ? "userReadSequence" : "adminReadSequence";
    const unreadField = identity.role === "user" ? "unreadUser" : "unreadAdmin";
    const session = await mongoose.startSession();
    try {
        await session.withTransaction(async () => {
            const conversation = await ChatConversation.findById(id).session(session);
            if (!conversation) throw new AppError("Conversation not found", 404);
            const upTo = Math.max(conversation[readField], Math.min(sequence, conversation.sequence));
            if (upTo === conversation[readField]) return;
            const unread = await ChatMessage.countDocuments({
                conversation: id,
                sender: identity.role === "user" ? { $in: ["admin", "bot"] } : "user",
                sequence: { $gt: upTo },
            }).session(session);
            await ChatConversation.updateOne({ _id: id }, {
                $set: { [readField]: upTo, [unreadField]: unread },
            }, { session });
        });
    } finally {
        await session.endSession();
    }
}

export async function listChatConversations(page: number, search: string, unreadOnly: boolean) {
    const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const filteredMatch = {
        ...(unreadOnly ? { unreadAdmin: { $gt: 0 } } : {}),
        ...(search ? { $or: ["customer.name", "customer.email", "lastMessage"].map((field) => ({ [field]: { $regex: escaped, $options: "i" } })) } : {}),
    };
    const [result] = await ChatConversation.aggregate([
        { $match: { sequence: { $gt: 0 } } },
        { $lookup: { from: "users", localField: "user", foreignField: "_id", as: "customer" } },
        { $unwind: "$customer" },
        { $facet: {
            counts: [{ $group: { _id: null, all: { $sum: 1 }, unread: { $sum: { $cond: [{ $gt: ["$unreadAdmin", 0] }, 1, 0] } } } }],
            total: [{ $match: filteredMatch }, { $count: "value" }],
            items: [
                { $match: filteredMatch },
                { $sort: { lastMessageAt: -1, _id: -1 } },
                { $skip: (page - 1) * 20 }, { $limit: 20 }, { $project: {
                    _id: 1, user: 1, unreadAdmin: 1, sequence: 1, lastMessage: 1, lastSender: 1, lastMessageAt: 1,
                    "customer.name": 1, "customer.email": 1,
                } },
            ],
        } },
    ]);
    const total = result.total[0]?.value || 0;
    const conversations: ChatConversationData[] = result.items.map((item: {
        _id: mongoose.Types.ObjectId; customer: { name: string; email: string };
        unreadAdmin: number; sequence: number; lastMessage: string;
        lastSender: "user" | "admin" | "bot"; lastMessageAt: Date;
    }) => ({
        id: item._id.toString(), name: item.customer.name, email: item.customer.email,
        unread: item.unreadAdmin,
        messages: [{ id: `last-${item._id}`, conversationId: item._id.toString(), sequence: item.sequence,
            sender: item.lastSender, text: item.lastMessage, createdAt: item.lastMessageAt.toISOString(), time: "" }],
    }));
    return { conversations, counts: result.counts[0] || { all: 0, unread: 0 },
        pagination: { page, total, totalPages: Math.max(1, Math.ceil(total / 20)) } };
}

export async function isChatAdminOnline() {
    return Boolean(await ChatPresence.exists({ expiresAt: { $gt: new Date() } }));
}
