import mongoose, { Schema } from "mongoose";

const chatPresenceSchema = new Schema({
    _id: { type: String, required: true },
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    expiresAt: { type: Date, required: true },
});

chatPresenceSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.ChatPresence || mongoose.model("ChatPresence", chatPresenceSchema);
