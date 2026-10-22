import mongoose from "mongoose";
import ChatConversation from "@/models/ChatConversation";
import ChatMessage from "@/models/ChatMessage";
import { isChatAdminOnline, serializeChatMessage } from "@/services/chat.service";
import { generateGeminiReply, isChatBotAvailable, type AssistantHistory } from "@/services/gemini.service";
import { rateLimiters } from "@/lib/rate-limit";
import type { ChatMessageData } from "@/types/chat";
import { getChatStoreData } from "@/services/chat-context.service";

const unavailableReply = "The AI assistant is temporarily unavailable. Your message is saved for our store team. Please try again shortly.";

export async function replyWhenAdminOffline(message: ChatMessageData, options: {
    generateReply?: (history: AssistantHistory) => Promise<string>;
    limitReply?: (userId: string) => Promise<{ success: boolean }>;
} = {}) {
    if (message.sender !== "user" || !isChatBotAvailable() || await isChatAdminOnline()) return null;
    const conversation = await ChatConversation.findOne({ _id: message.conversationId, sequence: message.sequence, lastSender: "user" });
    if (!conversation) return null;

    const claimUntil = new Date(Date.now() + 60000);
    const source = await ChatMessage.findOneAndUpdate({
        _id: message.id, conversation: conversation._id, senderId: conversation.user, sender: "user",
        botHandledAt: { $exists: false },
        $or: [{ botClaimUntil: { $exists: false } }, { botClaimUntil: { $lte: new Date() } }],
    }, { $set: { botClaimUntil: claimUntil } });
    if (!source) return null;

    try {
        let text = unavailableReply;
        try {
            const limitReply = options.limitReply || ((userId: string) => rateLimiters.chatBot.limit(userId));
            if ((await limitReply(conversation.user.toString())).success) {
                const history = await ChatMessage.find({ conversation: conversation._id, sequence: { $lte: message.sequence } })
                    .sort({ sequence: -1 }).limit(20).select("sender text").lean();
                const messages = history.reverse() as AssistantHistory;
                text = (await (options.generateReply
                    ? options.generateReply(messages)
                    : generateGeminiReply(messages, (args) => getChatStoreData(conversation.user.toString(), args))))
                    .trim().slice(0, 2000) || unavailableReply;
            } else {
                text = "Please wait a minute before asking the AI assistant another question. Your message is saved for our store team.";
            }
        } catch (error) {
            console.error("AI chat reply failed:", error instanceof Error ? error.message : "Unknown error");
        }

        if (await isChatAdminOnline()) return null;
        return await mongoose.connection.transaction(async (session) => {
            if (await isChatAdminOnline()) return null;
            const claimed = await ChatMessage.exists({ _id: source._id, botClaimUntil: claimUntil, botHandledAt: { $exists: false } }).session(session);
            if (!claimed || claimUntil.getTime() <= Date.now()) return null;
            const updated = await ChatConversation.findOneAndUpdate({
                _id: conversation._id, sequence: message.sequence, lastSender: "user",
            }, {
                $inc: { sequence: 1, unreadUser: 1 },
                $set: { lastMessage: text, lastSender: "bot", lastMessageAt: new Date() },
            }, { returnDocument: "after", session });
            if (!updated) return null;
            const [reply] = await ChatMessage.create([{
                conversation: conversation._id, sender: "bot", replyTo: source._id,
                clientMessageId: `bot-${source._id}`, sequence: updated.sequence, text,
            }], { session });
            await ChatMessage.updateOne({ _id: source._id, botClaimUntil: claimUntil }, {
                $set: { botHandledAt: new Date() }, $unset: { botClaimUntil: "" },
            }, { session });
            return serializeChatMessage(reply);
        });
    } finally {
        await ChatMessage.updateOne({ _id: source._id, botClaimUntil: claimUntil }, {
            $set: { botHandledAt: new Date() }, $unset: { botClaimUntil: "" },
        });
    }
}
