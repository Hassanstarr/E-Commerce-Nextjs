import mongoose, { Schema } from "mongoose";

const pendingSignupSchema = new Schema({
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    name: { type: String, required: true },
    passwordHash: { type: String, required: true, select: false },
    tokenHash: { type: String, required: true, unique: true },
    otpHash: { type: String, required: true, select: false },
    attempts: { type: Number, default: 0 },
    sentAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
}, { timestamps: true });

pendingSignupSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.PendingSignup || mongoose.model("PendingSignup", pendingSignupSchema);
