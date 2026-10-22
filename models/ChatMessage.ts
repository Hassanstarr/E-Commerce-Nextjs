import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema({
    conversation: { type: Schema.Types.ObjectId, ref: "ChatConversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: function () { return this.sender !== "bot"; } },
    sender: { type: String, enum: ["user", "admin", "bot"], required: true },
    clientMessageId: { type: String, required: true },
    sequence: { type: Number, required: true },
    text: { type: String, required: true, maxlength: 2000 },
    replyTo: { type: Schema.Types.ObjectId, ref: "ChatMessage", required: function () { return this.sender === "bot"; } },
    botClaimUntil: { type: Date, select: false },
    botHandledAt: { type: Date, select: false },
}, { timestamps: true });

chatMessageSchema.index({ senderId: 1, clientMessageId: 1 }, { unique: true });
chatMessageSchema.index({ conversation: 1, sequence: -1 }, { unique: true });
chatMessageSchema.index({ replyTo: 1 }, { unique: true, partialFilterExpression: { sender: "bot" } });

export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);
