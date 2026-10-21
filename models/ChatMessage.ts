import mongoose, { Schema } from "mongoose";

const chatMessageSchema = new Schema({
    conversation: { type: Schema.Types.ObjectId, ref: "ChatConversation", required: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    sender: { type: String, enum: ["user", "admin"], required: true },
    clientMessageId: { type: String, required: true },
    sequence: { type: Number, required: true },
    text: { type: String, required: true, maxlength: 2000 },
}, { timestamps: true });

chatMessageSchema.index({ senderId: 1, clientMessageId: 1 }, { unique: true });
chatMessageSchema.index({ conversation: 1, sequence: -1 }, { unique: true });

export default mongoose.models.ChatMessage || mongoose.model("ChatMessage", chatMessageSchema);
