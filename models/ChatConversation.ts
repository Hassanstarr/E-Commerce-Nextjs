import mongoose, { Schema } from "mongoose";

const chatConversationSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    sequence: { type: Number, default: 0 },
    userReadSequence: { type: Number, default: 0 },
    adminReadSequence: { type: Number, default: 0 },
    unreadUser: { type: Number, default: 0 },
    unreadAdmin: { type: Number, default: 0 },
    lastMessage: { type: String, default: "" },
    lastSender: { type: String, enum: ["user", "admin", "bot"] },
    lastMessageAt: { type: Date },
}, { timestamps: true });

chatConversationSchema.index({ lastMessageAt: -1, _id: -1 });

export default mongoose.models.ChatConversation || mongoose.model("ChatConversation", chatConversationSchema);
