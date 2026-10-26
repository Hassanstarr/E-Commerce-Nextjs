import mongoose, { Schema } from "mongoose";

const membershipSchema = new Schema({
    user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    customerId: String,
    subscriptionId: { type: String, unique: true, sparse: true },
    checkoutId: String,
    attemptId: String,
    attemptAt: Date,
    priceId: String,
    unitAmount: Number,
    currency: String,
    status: { type: String, default: "none" },
    paidUntil: Date,
    currentPeriodEnd: Date,
    cancelAtPeriodEnd: { type: Boolean, default: false },
    invoiceUrl: String,
    lockToken: String,
    lockUntil: Date,
}, { timestamps: true });

export default mongoose.models.Membership || mongoose.model("Membership", membershipSchema);
